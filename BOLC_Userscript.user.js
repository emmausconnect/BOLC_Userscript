// ==UserScript==
// @name        BOLC / newmips.cloud
// @namespace   BOLC Newmips Patch
// @match       https://lacollecte.newmips.cloud/*
// @match       https://app-emmaus-cloud.newmips.run/*
// @homepageURL https://github.com/emmausconnect/BOLC_Userscript
// @downloadURL https://raw.githubusercontent.com/emmausconnect/BOLC_Userscript/refs/heads/main/BOLC_Userscript.user.js
// @updateURL   https://raw.githubusercontent.com/emmausconnect/BOLC_Userscript/refs/heads/main/BOLC_Userscript.user.js
// @grant       none
// @version     1.0
// @author      Joffrey SCHROEDER / @Write on Github
// @inject-into content
// ==/UserScript==

(function() {
  'use strict';

  /* ----------------
   *   CONFIGURATION
   * ----------------
   * */
  const CONFIG = {
      DEBUG: true,
      ANIMATION_SPEED: 0,
      MIN_COL_WIDTH: 70,
      TABLE_DISPLAY_OPTIONS: [1000, 2000, 3000, 5000, 10000],
      PATHS_WITH_TABLEAU: [
          "/materiel_disponible/list",
          "/materiel_pa/list",
          "/contact/list",
          "/don/list",
          "/donateur/list",
          "/relais/list",
          "/reconditionnement/list",
          //"/personne_morale/list",
          "/besoin_relais/list",
          "/ticket_sav/list",
          "/log_import/list"
      ]
  };

  /* ----------------
   *   HELPERS
   * ----------------
   * */


  const logger = {
      log: (str) => {
          if (CONFIG.DEBUG) {
              const scriptVersion = GM_info.script.version;
              const style = 'background: #0066ff; color: white; padding: 2px 5px; border-radius: 3px;';
              console.log(`📜 %c[BOLCScript]%c (${scriptVersion}) : ${str}`, style, '');
          }
      },
      error: (str) => {
          const scriptVersion = GM_info.script.version;
          const style = 'background: #ff0000; color: white; padding: 2px 5px; border-radius: 3px;';
          console.error(`📜 %c[BOLCScript]%c (${scriptVersion}) ERROR: ${str}`, style, '');
      }
  };

  const utils = {
      isDark: window.matchMedia?.("(prefers-color-scheme: dark)").matches,
      platform: window.navigator.platform,
      currentPagepath: window.location.pathname,
      currentUrl: window.location.href,
      theme: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light",

      match: (str, rule) => {
          const escapeRegex = (s) => s.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
          return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
      },

      addScript: (text) => {
          const newScript = document.createElement('script');
          newScript.type = "application/javascript";
          newScript.textContent = text;
          document.head.appendChild(newScript);
      },

      paste: (str) => {
          const node = document.createElement('style');
          node.type = 'text/css';
          node.appendChild(document.createTextNode(str.replace(/;/g, ' !important;')));
          (document.head || document.documentElement).appendChild(node);
      },

      checkElement: async (selector) => {
          while (document.querySelector(selector) === null) {
              await new Promise(resolve => requestAnimationFrame(resolve));
          }
          return document.querySelector(selector);
      },

      removeGarbage: (arr) => {
          arr.forEach(e => {
              utils.checkElement(e).then((selector) => {
                  logger.log(`Deleting element -- ${e}`);
                  selector.remove();
              });
          });
      },

      clearEventListener: (element) => {
          const clonedElement = element.cloneNode(true);
          element.replaceWith(clonedElement);
          return clonedElement;
      }
  };

  /* ----------------
   *   MAIN SCRIPT
   * ----------------
   * */
  const init = () => {

      // Écouter les événements de log depuis le contexte principal
      document.addEventListener('BOLCScript_log', function(e) {
          logger.log(e.detail);
      });

      document.addEventListener('BOLCScript_error', function(e) {
          logger.error(e.detail);
      });

      // Log load context
      if (window.top === window.self) {
          logger.log(`(main) Loaded on: ${utils.currentUrl}`);
      } else {
          logger.log(`(iframe) Loaded on: ${utils.currentUrl}`);
      }

      // Append la version du script à côté de la version du BOLC
      const scriptVersion = GM_info.script.version;
      const targetElement = document.querySelector('li[style*="padding: 20px 18px 0 18px !important;"] > div');

      if (targetElement) {
          // Ajouter la version après le texte existant
          targetElement.innerHTML += ` - BOLCScript v${scriptVersion}`;
      }

      // Inject le code directement dans le contexte principale.
      // Obligatoire car nous utilisons @inject-into content
      // Pour la compatibilité avec Safari.
      (function() {
          const script = document.createElement('script');
          script.textContent = `
            (function() {
                const animationSpeed = ${CONFIG.ANIMATION_SPEED};
                const interval = setInterval(() => {
                    if (window.jQuery && window.jQuery.AdminLTE) {
                        clearInterval(interval);

                        // Configure animations
                        $.AdminLTE.options.animationSpeed = animationSpeed;

                        // Initialize the sidebar tree
                        $.AdminLTE.tree('.sidebar');

                        // Activate all box widgets
                        $('.box').each(function () {
                            $.AdminLTE.boxWidget.activate(this);
                        });

                        // Activate global box widget
                        $.AdminLTE.boxWidget.activate();
                    }
                }, 50); // Check every 50ms if jQuery is loaded
            })();
        `;
          document.documentElement.appendChild(script);
          script.remove();
      })();

      // Extend table display options
      utils.checkElement('select[name]').then((selector) => {
          CONFIG.TABLE_DISPLAY_OPTIONS.forEach(value => {
              const option = document.createElement('option');
              option.value = value;
              option.textContent = value;
              selector.appendChild(option);
          });
      });

      // Apply styles for specific paths
      if (CONFIG.PATHS_WITH_TABLEAU.some(path => utils.currentPagepath.startsWith(path))) {
          applyTableauStyles();
          setupTableInteractions();
          setupTablePaginationMemory();
      }

      // Global styles
      const globalStyle = `
      .fade {
          transition: opacity 0s linear;
          opacity: 1;
          -webkit-transition: opacity 0s linear;
          transition: opacity 0s linear;
          background: #cccccc4f;
      }
      a[style^="color: rgb(60, 141, 188)"] {
        color: white;
        background: #09acbe;
      }
      .sidebar-collapse .sidebar-menu li.active > a {
        background: #0ca4ba;
        color: white;
      }
      th:last-child {
        padding-right: 300;
        border-right: 5px solid transparent;
      }
      a.dt-button.btnSTL {
        top: unset;
      }
      .fields th {
        overflow: hidden;
      }
      .fields {
        white-space: nowrap;
        overflow: hidden;
      }
      tr td {
        overflow: hidden;
        white-space: nowrap;
      }
      .sidebar-menu .treeview-menu > li:hover > a {
        color: #fff;
      }
      @media (min-width: 768px) {
        .sidebar-mini.sidebar-collapse .sidebar-menu > li:hover > a > span {
          top: 0;
          margin-left: -3px;
          padding: 12px 5px 11px 20px;
          background-color: #0ca4ba;
          color: white;
        }
        .sidebar-mini.sidebar-collapse .sidebar-menu > li > .treeview-menu {
          padding-top: 0px;
          padding-bottom: 0px;
          border-bottom-right-radius: 0px;
        }
        .sidebar-mini.sidebar-collapse .sidebar-menu > li > .treeview-menu {
          padding-bottom: 0px;
        }
      }
      .sidebar-menu .treeview-menu > li:hover > a {
        background: #777777;;
      }
      .sidebar-collapse li.treeview span {
        box-shadow: 3px -2px 3px #ccc;
      }
      .sidebar-collapse li ul.treeview-menu {
        box-shadow: 3px 3px 3px #ccc;
      }
      .sidebar-collapse ul.treeview-menu li:hover {
        background: #ccc;
      }
      .sidebar-menu .treeview-menu {
        padding-left: 0px;
      }
      .sidebar-menu .treeview-menu > li > a {
        padding: 5px 0px 5px 10px;
        display: block;
        font-size: 13px;
      }
      .btn {
        padding: 0px 4px;
        font-size: 13px;
      }
      .content-header > h1 {
        display: none;
      }
      .main-header .sidebar-toggle {
        padding: 5px 10px;
      }
      .navbar-nav > li, sidebar-toggle {
        padding-top: 0px;
      }
      .main-header .navbar {
        min-height: 0;
        padding: 0px 15px 0 0;
        height: 32px;
        margin-left: 230px;
      }
      .sidebar-mini.sidebar-collapse .main-header .navbar {
        margin-left: 44px;
      }
      .form-control {
        height: 25px;
        padding: 0px 0px 0px 5px;
        font-size: 13px;
        min-height: 28px;
      }
      tr:hover td a {
          color: white;
      }
      @media (min-width: 768px) {
        .hover:hover, .inline-help:hover, input[type="color"]:hover, .insert:hover, table > tbody > tr:hover,
        .table-striped > tbody > tr:hover:nth-child(2n+1) > td {
          color: white;
          background-color: #1391b1;
        }
        body.sidebar-mini.sidebar-collapse .content-wrapper, .sidebar-mini.sidebar-collapse .right-side, .sidebar-mini.sidebar-collapse .main-footer {
          margin-left: 45px;
        }
        .sidebar-mini.sidebar-collapse .main-header .navbar {
          margin-left: 0px;
        }
        .sidebar-mini.sidebar-collapse .sidebar-menu > li:hover > a > span:not(.pull-right), .sidebar-mini.sidebar-collapse .sidebar-menu > li:hover > .treeview-menu {
          left: 44px;
          border-left: 1px solid #ccc;
          cursor: auto;
        }
        body.sidebar-mini.sidebar-collapse .main-sidebar {
          width: 45px;
        }
      }
      .navbar-nav > li, sidebar-toggle {
        min-height: 0;
      }
      .sidebar-toggle {
        min-height: 0;
      }
      .dataTables_length {
        float: left;
        padding-left: 15px;
      }
      .nav > li:nth-child(1) > div:nth-child(1) {
        margin-top: -16px;
        padding: 2px 10px 0px 10px;
      }
      .table > thead > tr > th, .table > tbody > tr > th, .table > tfoot > tr > th, .table > thead > tr > td, .table > tbody > tr > td, .table > tfoot > tr > td {
        padding: 3px;
      }
      .main-sidebar, .left-side {
        padding-top: 0px;
      }
      body {
        font-size: small;
      }
      .info-box-icon, .info-box, i {
        -webkit-transition: all 0s linear;
        -o-transition: all 0s linear;
        transition: all 0s linear;
      }
      .sidebar-menu > li {
        -webkit-transition: border-left-color 0s ease;
        -o-transition: border-left-color 0s ease;
        transition: border-left-color 0s ease;
      }
      .main-header .navbar {
        -webkit-transition: margin-left 0s ease-in-out;
        -o-transition: margin-left 0s ease-in-out;
        transition: margin-left 0s ease-in-out;
      }
      .main-sidebar, .left-side {
        -webkit-transition: -webkit-transform 0s ease-in-out, width 0s ease-in-out;
        -moz-transition: -moz-transform 0s ease-in-out, width 0s ease-in-out;
        -o-transition: -o-transform 0s ease-in-out, width 0s ease-in-out;
        transition: transform 0s ease-in-out, width 0s ease-in-out;
      }
      .content-wrapper, .right-side, .main-footer {
        -webkit-transition: -webkit-transform 0s ease-in-out, margin 0s ease-in-out;
        -moz-transition: -moz-transform 0s ease-in-out, margin 0s ease-in-out;
        -o-transition: -o-transform 0s ease-in-out, margin 0s ease-in-out;
        transition: transform 0s ease-in-out, margin 0s ease-in-out;
      }
      .logo {
        display: none;
      }
      aside.main-sidebar, .left-side {
        background-color: #fff;
        width: 230px;
        box-shadow: unset;
        border-right: 1px solid #ccc;
      }
      @media (min-width: 768px) {
        .navbar-nav > li > a {
          padding-top: 5px;
          padding-bottom: 0px;
        }
      }
      .content-header > .breadcrumb {
        padding: 0px 5px;
        position: absolute;
        top: 10px;
        left: 10px;
      }
      .content {
        padding: 5px 0px 0px 0px;
      }
      .box-header {
        padding: 10px 0px 10px 5px !important;
      }
      .animated {
        -webkit-animation-duration: 0s;
        animation-duration: 0;
        scale: both;
        animation-fill-mode: unset;
      }
    `;
      utils.paste(globalStyle);
  };

  const applyTableauStyles = () => {
      const tableauStyle = `

        tr td a:hover {
            color: #fafafa;
        }
        .paging_simple_numbers .pagination .paginate_button:hover a {
          background: #095f68;
        }
        tr td a:hover {
            color: #fafafa;
        }
        .paging_simple_numbers .pagination .paginate_button.active a {
          background: #09acbe;
        }
        .paging_simple_numbers .pagination .paginate_button.disabled:hover a {
          background: #eee;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button:hover {
          color: white;
          border: 1px solid transparent;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button.disabled, .dataTables_wrapper .dataTables_paginate .paginate_button.disabled:hover, .dataTables_wrapper .dataTables_paginate .paginate_button.disabled:active {
          background: white;
        }
        .pagination > .disabled > a, .pagination > .disabled > a:hover {
          background: white;
        }
        .pagination > .disabled > span, .pagination > .disabled > span:hover, .pagination > .disabled > span:focus, .pagination > .disabled > a, .pagination > .disabled > a:hover, .pagination > .disabled > a:focus {
          color: #c6c6c6;
          cursor: not-allowed;
          background-color: #f2f2f2;
          text-shadow: 0px 1px 0px #fff;
        }
        .pagination > li > a, .pagination > li > span {
        margin-left: unset;
        }
        #table_e_materiel_pa_info, .btn.btn-default {
          margin-left: 20px;
        }
        .dataTables_paginate {
          position: fixed;
          bottom: 5px;
          right: 5px;
          z-index: 9999;
          background: #aaa5a5b2;
          padding: 3px;
          margin: 0px;
          border-radius: 6px;
          line-height: 0;
        }
        .paginate_button {
          border-radius: 4px;
        }
        .pagination {
          line-height: 0;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button:first-child {
          margin-left: 0px;
        }
        div.dataTables_paginate ul.pagination {
          margin: 0;
          padding: 0;
        }
        .table-responsive {
          margin-bottom: 0px;
        }
        .box {
          margin-bottom: 0px;
        }
        table.dataTable {
          clear: both;
          margin-top: 0px;
          margin-bottom: 0px;
          table-layout: fixed;
        }
        section.content-header, section.content, div.content-wrapper {
          background: white;
        }
        .box-body {
          padding: 0;
        }
        .box {
          padding: 0;
        }
        .content-wrapper {
          padding: 0;
        }

        .col-xs-1, .col-sm-1, .col-md-1, .col-lg-1, .col-xs-2, .col-sm-2, .col-md-2, .col-lg-2, .col-xs-3, .col-sm-3, .col-md-3, .col-lg-3, .col-xs-4, .col-sm-4, .col-md-4, .col-lg-4, .col-xs-5, .col-sm-5, .col-md-5, .col-lg-5, .col-xs-6, .col-sm-6, .col-md-6, .col-lg-6, .col-xs-7, .col-sm-7, .col-md-7, .col-lg-7, .col-xs-8, .col-sm-8, .col-md-8, .col-lg-8, .col-xs-9, .col-sm-9, .col-md-9, .col-lg-9, .col-xs-10, .col-sm-10, .col-md-10, .col-lg-10, .col-xs-11, .col-sm-11, .col-md-11, .col-lg-11, .col-xs-12, .col-sm-12, .col-md-12, .col-lg-12 {
          padding: 0;
        }
        .fixedHeader-floating {
           display: none;
         }
      `;
      utils.paste(tableauStyle);
  };

  const setupTableInteractions = () => {
      const initialize = () => {
          disableScrollEvents();
          disableFixedHeader();
          setupTableResizing();
          setupDataTableOverflow();
          fixTableColumns();
      };

      if (document.readyState === "loading") {
          // Le document n'est pas encore prêt, on attend l'événement DOMContentLoaded
          document.addEventListener('DOMContentLoaded', initialize);
      } else {
          // Le document est déjà prêt, on initialise directement
          initialize();
      }
  };

  const setupTablePaginationMemory = () => {
      const script = document.createElement('script');
      script.textContent = `
      (function() {
          // Création d'un bridge pour le logger
          const logger = {
              log: (message) => {
                  document.dispatchEvent(new CustomEvent('BOLCScript_log', { detail: message }));
              },
              error: (message) => {
                  document.dispatchEvent(new CustomEvent('BOLCScript_error', { detail: message }));
              }
          };

          logger.log('Script injected into main context');

          // Attend que jQuery et DataTable soient disponibles
          const waitForDataTable = setInterval(() => {
              if (typeof jQuery === 'undefined' || typeof jQuery.fn.DataTable === 'undefined') {
                  logger.log('Waiting for jQuery and DataTable...');
                  return;
              }

              const table = jQuery('.dataTable');
              if (table.length === 0) {
                  logger.log('Waiting for DataTable to be present in DOM...');
                  return;
              }

              try {
                  const dataTable = table.DataTable();
                  if (dataTable) {
                      logger.log('DataTable found and initialized');

                      clearInterval(waitForDataTable);

                      // Gestion du changement de page
                      dataTable.on('page.dt', function() {
                          const currentPage = dataTable.page();
                          logger.log('Page changed to: ' + currentPage);

                          // Mise à jour de l'URL
                          const url = new URL(window.location);
                          url.hash = 'page=' + currentPage;
                          window.history.replaceState({}, '', url);
                          logger.log('URL updated: ' + url.toString());
                      });

                      // Restauration de la page au chargement
                      const restorePage = () => {
                          logger.log('Attempting to restore page from URL');
                          const urlParams = new URLSearchParams(window.location.hash.slice(1));
                          const pageFromUrl = urlParams.get('page');

                          if (pageFromUrl !== null) {
                              logger.log('Found page in URL: ' + pageFromUrl);
                              try {
                                  const pageNumber = parseInt(pageFromUrl);
                                  const pageInfo = dataTable.page.info();

                                  logger.log('Current page info: ' + JSON.stringify(pageInfo));

                                  if (pageNumber >= 0 && pageNumber < pageInfo.pages) {
                                      logger.log('Setting page to: ' + pageNumber);
                                      dataTable.page(pageNumber).draw('page');
                                  } else {
                                      logger.error('Page number out of bounds: ' + pageNumber + ' (total pages: ' + pageInfo.pages + ')');
                                  }
                              } catch (error) {
                                  logger.error('Error restoring page: ' + error.message);
                              }
                          } else {
                              logger.log('No page found in URL');
                          }
                      };

                      // Restaure la page après un court délai
                      logger.log('Setting up delayed page restoration');
                      setTimeout(restorePage, 100);

                      // Écoute les changements de hash dans l'URL
                      window.addEventListener('hashchange', function() {
                          logger.log('URL hash changed');
                          const urlParams = new URLSearchParams(window.location.hash.slice(1));
                          const pageFromUrl = urlParams.get('page');
                          if (pageFromUrl !== null) {
                              logger.log('Changing page from hash change: ' + pageFromUrl);
                              try {
                                  dataTable.page(parseInt(pageFromUrl)).draw('page');
                              } catch (error) {
                                  logger.error('Error changing page from hash: ' + error.message);
                              }
                          }
                      });

                      logger.log('Page persistence initialization complete');
                  }
              } catch (error) {
                  logger.error('Error accessing DataTable: ' + error.message);
              }
          }, 100);
      })();
  `;

      document.head.appendChild(script);
  }

  const fixTableColumns = () => {
      utils.checkElement('.dataTable').then((dataTable) => {
          logger.log('Fixing table column widths');
          const lastThreeHeaders = dataTable.querySelectorAll('th:nth-last-child(-n+3)');
          lastThreeHeaders.forEach(th => {
              th.style.width = '90px';
          });
      });
  };

  const disableScrollEvents = () => {
      document.addEventListener('scroll', (event) => {
          event.preventDefault();
          event.stopPropagation();
      });
  };

  const disableFixedHeader = () => {
      const table = document.querySelector('#table_id');

      if (table) {
          table.addEventListener('page.dt', () => {
              document.querySelectorAll('.fixedHeader-floating').forEach(el => el.remove());
          });

          table.addEventListener('draw.dt', () => {
              document.querySelectorAll('.fixedHeader-floating').forEach(el => el.remove());
          });
      }

  };

  const setupTableResizing = () => {
      document.addEventListener('mousedown', function(e) {
          logger.log("mousedown listenerd")
          // Vérifier si on clique sur une poignée de redimensionnement
          if (
              e.target.classList.contains('DTCR_tableHeader') ||
              e.target.classList.contains('DTCR_tableHeaderHover')
          ) {
              // Pendant le drag uniquement
              const mouseMoveHandler = function(e) {
                  const columns = document.querySelectorAll('th');
                  logger.log("dragging")
                  columns.forEach(col => {
                      if (col.offsetWidth < CONFIG.MIN_COL_WIDTH) {
                          col.style.width = `${CONFIG.MIN_COL_WIDTH}px`;
                      }
                  });
              };

              // Nettoyer quand on relâche
              const mouseUpHandler = function() {
                  // Vérifier une dernière fois après un court délai
                  setTimeout(() => {
                      const columns = document.querySelectorAll('th');
                      columns.forEach(col => {
                          if (col.offsetWidth < CONFIG.MIN_COL_WIDTH) {
                              col.style.width = `${CONFIG.MIN_COL_WIDTH}px`;
                          }
                      });
                  }, 50); // petit délai pour laisser DataTables finir son traitement

                  document.removeEventListener('mousemove', mouseMoveHandler);
                  document.removeEventListener('mouseup', mouseUpHandler);
              };

              document.addEventListener('mousemove', mouseMoveHandler);
              document.addEventListener('mouseup', mouseUpHandler);
          }
      });
  }

  const setupDataTableOverflow = () => {
      (function() {
          const script = document.createElement('script');
          script.textContent = `
          const logger2 = {
              log: (message) => {
                  document.dispatchEvent(new CustomEvent('BOLCScript_log', { detail: message }));
              },
              error: (message) => {
                  document.dispatchEvent(new CustomEvent('BOLCScript_error', { detail: message }));
              }
          };

          const createMovablePaginationButton = (paginateContainer) => {
              if (paginateContainer.querySelector('.move_button')) return;
              const moveButton = document.createElement('li');
              moveButton.classList.add('paginate_button', 'move_button');
              moveButton.innerHTML = '<a href="#" style="cursor: grab;">🖐</a>';
              paginateContainer.querySelector('ul').prepend(moveButton);
              let isMoving = false;
              let startX = 0;
              let startRight = parseInt(window.getComputedStyle(paginateContainer).right, 10) || 0;
              moveButton.querySelector('a').addEventListener('click', (e) => {
                  e.preventDefault();
              });
              moveButton.addEventListener('mousedown', (e) => {
                  isMoving = true;
                  startX = e.pageX;
                  startRight = parseInt(window.getComputedStyle(paginateContainer).right, 10) || 0;
                  e.preventDefault();
                  moveButton.querySelector('a').style.cursor = 'grabbing';
              });
              document.addEventListener('mousemove', (e) => {
                  if (!isMoving) return;
                  const moveX = e.pageX - startX;
                  const minRight = 0;
                  const maxRight = window.innerWidth - paginateContainer.offsetWidth;
                  const newRight = startRight - moveX;
                  paginateContainer.style.setProperty('right', \`\${Math.min(Math.max(newRight, minRight), maxRight)}px\`, 'important');
              });
              document.addEventListener('mouseup', () => {
                  isMoving = false;
                  moveButton.querySelector('a').style.cursor = 'grab';
              });
              moveButton.addEventListener('dragstart', (e) => e.preventDefault());
          };

        // Handle pagination clicks to scroll to top
        const setupPaginationScrollToTop = (dtable) => {
            const scrollToTop = () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'instant'
                });
            };
            // Intercept pagination clicks
            $(document).on('click', '.dataTables_paginate .paginate_button:not(.move_button)', function(e) {
                // Only scroll if we're not already at the top
                if (window.scrollY > 0) {
                    scrollToTop();
                }
            });
            // Also handle length change dropdown if it exists
            $(document).on('change', '.dataTables_length select', function(e) {
                if (window.scrollY > 0) {
                    scrollToTop();
                }
            });
        };

         // Safe DataTable handling with retry logic
         const initializeDataTableOverflow = () => {
             const MAX_RETRIES = 10; // Maximum number of retries
             const RETRY_DELAY = 500; // Delay between retries in milliseconds
             let retryCount = 0;
             const tryInitialize = () => {
                 logger2.log('Attempting to initialize DataTableOverflow (Retry)');
                 const $dataTable = $('.dataTable');
                 // Ensure we have a table to work with
                 if (!$dataTable.length) {
                     logger2.error('No .dataTable element found');
                     return;
                 }
                 let dtable;
                 try {
                     // Check if DataTable is initialized
                     if ($.fn.DataTable.isDataTable($dataTable)) {
                         dtable = $dataTable.DataTable();
                     } else {
                         retryCount++;
                         if (retryCount <= MAX_RETRIES) {
                             logger2.log('DataTable not initialized yet. Retrying in ms...');
                             setTimeout(tryInitialize, RETRY_DELAY);
                         } else {
                             logger2.error('DataTable initialization failed after maximum retries.');
                         }
                         return; // Exit this attempt
                     }

                    // Setup pagination scroll to top
                    setupPaginationScrollToTop(dtable);

                     // Apply styles and listeners
                     $dataTable.css('table-layout', 'fixed');
                     dtable.columns().every(function () {
                         const $header = $(this.header());
                         if ($header.length) {
                             $header.css({
                                 'min-width': '${CONFIG.MIN_COL_WIDTH}px',
                                 'overflow': 'hidden',
                                 'text-overflow': 'ellipsis'
                             });
                         }
                     });
                     dtable.on('draw', () => {
                         logger2.log('Table draw event');
                         setTimeout(() => {
                             const columns = document.querySelectorAll('th');
                             columns.forEach(col => {
                                 if (col.offsetWidth < '${CONFIG.MIN_COL_WIDTH}') {
                                     col.style.width = '${CONFIG.MIN_COL_WIDTH}px';
                                 }
                             });
                         }, 50);
                         const paginateContainer = document.querySelector('.dataTables_paginate');
                         if (paginateContainer) {
                             createMovablePaginationButton(paginateContainer);
                         }
                     });
                     dtable.columns.adjust();
                     logger2.log('DataTableOverflow initialized successfully.');
                 } catch (error) {
                     logger2.error('Error in DataTable handling:', error);
                 }
             };
             tryInitialize();
         };
         // Wait for document ready
         if (document.readyState === 'loading') {
             logger2.log('Document not ready, attaching DOMContentLoaded listener.');
             document.addEventListener('DOMContentLoaded', initializeDataTableOverflow);
         } else {
             logger2.log('Document already ready. Calling initializeDataTableOverflow directly.');
             initializeDataTableOverflow();
         }
         `;
          document.documentElement.appendChild(script);
      })();
  };

  // Initialize script
  init();
})();