// ==UserScript==
// @name        B0LC / newmips.cloud
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
      DEBUG: false,
      ANIMATION_SPEED: 1,
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
              console.log(`📜 BOLCScript (${scriptVersion}) : ${str}`);
          }
      },
      error: (str) => {
          console.error(`📜 BOLC Userscript ERROR: ${str}`);
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
      (function () {
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
          // setupFloatingPagination();
          setupTableInteractions();
      }

      // Global styles
      const globalStyle = `
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

  // const setupFloatingPagination = () => {
  //     const checkExist = setInterval(() => {
  //         const paginateContainer = document.querySelector('.dataTables_paginate');
  //         if (paginateContainer) {
  //             clearInterval(checkExist);
  //             createMovablePaginationButton(paginateContainer);
  //         }
  //     }, 100);
  // };

  const createMovablePaginationButton = (paginateContainer) => {
      if (paginateContainer.querySelector('.move_button')) return;

      // Crée un bouton pour déplacer la pagination
      const moveButton = document.createElement('li');
      moveButton.classList.add('paginate_button', 'move_button');
      moveButton.innerHTML = '<a href="#" style="cursor: grab;">&#8592;</a>';

      paginateContainer.querySelector('ul').prepend(moveButton);

      // Variables de contrôle pour le mouvement
      let isMoving = false;
      let startX = 0;
      let startRight = parseInt(window.getComputedStyle(paginateContainer).right, 10) || 0;
      // Empêche le comportement par défaut du lien
      moveButton.querySelector('a').addEventListener('click', (e) => {
          e.preventDefault(); // Empêche de remonter en haut
      });
      // Fonction pour démarrer le mouvement lorsque le bouton est maintenu
      moveButton.addEventListener('mousedown', (e) => {
          isMoving = true;
          startX = e.pageX;
          // Sauvegarde la position actuelle 'right' au début du déplacement
          startRight = parseInt(window.getComputedStyle(paginateContainer).right, 10) || 0;
          e.preventDefault(); // Empêche la sélection de texte ou autres comportements par défaut
          moveButton.querySelector('a').style.cursor = 'grabbing';
      });
      // Fonction pour déplacer la pagination horizontalement
      document.addEventListener('mousemove', (e) => {
          if (!isMoving) return;
          // Calcul du déplacement horizontal
          const moveX = e.pageX - startX;
          // Calcul des limites de l'écran
          const minRight = 0; // Limite de gauche
          const maxRight = window.innerWidth - paginateContainer.offsetWidth;
          const newRight = startRight - moveX;
          paginateContainer.style.setProperty('right', `${Math.min(Math.max(newRight, minRight), maxRight)}px`, 'important');
      });
      // Arrêter le mouvement lorsque la souris est relâchée
      document.addEventListener('mouseup', () => {
          isMoving = false;
          moveButton.querySelector('a').style.cursor = 'grab';
      });
      // Empêcher le texte de se sélectionner pendant le déplacement
      moveButton.addEventListener('dragstart', (e) => e.preventDefault());
  };

  const setupTableInteractions = () => {
      document.addEventListener('DOMContentLoaded', () => {
          disableScrollEvents();
          disableFixedHeader();
          setupColumnResizing();
          fixTableColumns();
      });
  };

  const fixTableColumns = () => {
      utils.checkElement('.dataTable').then((dataTable) => {
          logger.log('Fixing table column widths');
          $(dataTable).find('th:nth-last-child(-n+3)').css('width', '90px');
      });
  };

  const disableScrollEvents = () => {
      $(document).on('scroll', (event) => {
          event.preventDefault();
          event.stopPropagation();
      });
  };

  const disableFixedHeader = () => {
      $('#table_id').on('page.dt draw.dt', () => {
          $('.fixedHeader-floating').remove();
      });
  };

  const setupColumnResizing = () => {
    // Wait for DataTables to be fully initialized
    const $dataTable = $('.dataTable');
    if (!$.fn.DataTable.isDataTable($dataTable)) {
        console.warn('DataTable not initialized yet');
        return;
    }

    document.addEventListener('mousedown', function(e) {
        // Vérifier si on clique sur une poignée de redimensionnement
        if (
            e.target.classList.contains('DTCR_tableHeader') ||
            e.target.classList.contains('DTCR_tableHeaderHover')
        ) {
            // Pendant le drag uniquement
            const mouseMoveHandler = function(e) {
                const columns = document.querySelectorAll('th');
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

    // Applique l'overflow.. + hidden.
    const dtable = $dataTable.DataTable();
    $dataTable.css('table-layout', 'fixed');
    try {
        dtable.columns().every(function() {
            const $header = $(this.header());
            if ($header.length) {
                $header.css({
                    'min-width': `${CONFIG.MIN_COL_WIDTH}px`,
                    'overflow': 'hidden',
                    'text-overflow': 'ellipsis'
                });
            }
        });
        dtable.on('draw', () => {
            const paginateContainer = document.querySelector('.dataTables_paginate');
            if (paginateContainer) {
                createMovablePaginationButton(paginateContainer);
            }
        });
        // Adjust column widths after initialization
        dtable.columns.adjust();
    } catch (error) {
        console.error('Error in column resizing:', error);
    }
  };

  // Initialize script
  init();
})();