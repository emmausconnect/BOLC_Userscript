// ==UserScript==
// @name        B0LC / newmips.cloud
// @namespace   BOLC Newmips Patch
// @match       https://lacollecte.newmips.cloud/*
// @match       https://app-emmaus-cloud.newmips.run/*
// @homepageURL https://github.com/emmausconnect/BOLC_Userscript
// @downloadURL https://raw.githubusercontent.com/emmausconnect/BOLC_Userscript/refs/heads/main/BOLC_Userscript.user.js
// @updateURL   https://raw.githubusercontent.com/emmausconnect/BOLC_Userscript/refs/heads/main/BOLC_Userscript.user.js
// @grant       none
// @version     1.2
// @author      Joffrey SCHROEDER / @Write on Github
// ==/UserScript==

(function() {
  'use strict';

  /* ----------------
   *   CONFIGURATION
   * ----------------
   * */
  const CONFIG = {
      DEBUG: false,
      ANIMATION_SPEED: 0,
      TABLE_DISPLAY_OPTIONS: [1000, 2000, 3000, 5000, 10000],
      PATHS_WITH_TABLEAU: [
          "/materiel_disponible/list",
          "/materiel_pa/list",
          "/don/list",
          "/relais/list",
          "/reconditionnement/list",
          "/personne_morale/list"
      ]
  };

  /* ----------------
   *   HELPERS
   * ----------------
   * */
  const logger = {
      log: (str) => {
          if (CONFIG.DEBUG) {
              console.log(`📜 BOLC Userscript: ${str}`);
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

      // Accelerate animations
      $.AdminLTE.options.animationSpeed = CONFIG.ANIMATION_SPEED;
      $.AdminLTE.tree('.sidebar');
      $('.box').each(function () {
          $.AdminLTE.boxWidget.activate(this);
      });
      $.AdminLTE.boxWidget.activate();

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
          setupFloatingPagination();
          setupTableInteractions();
      }

      // Global styles
      const globalStyle = `
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

        @media (min-width: 768px) {
          .sidebar-mini.sidebar-collapse .sidebar-menu > li > .treeview-menu {
            padding-bottom: 0px;
          }
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
          margin-left: 49px;
        }
        @media (max-width: 768px) {
          .sidebar-mini.sidebar-collapse .main-header .navbar {
            margin-left: 0px;
          }
        }
        @media (min-width: 768px) {
          .sidebar-mini.sidebar-collapse .sidebar-menu > li:hover > a > span:not(.pull-right), .sidebar-mini.sidebar-collapse .sidebar-menu > li:hover > .treeview-menu {
            left: 49px;
            border-left: 1px solid #ccc;
            cursor: auto;
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

        .main-header .navbar {
          -webkit-transition: margin-left 0.1s ease-in-out;
          -o-transition: margin-left 0.1s ease-in-out;
          transition: margin-left 0.1s ease-in-out;
        }

        .main-sidebar, .left-side {
          -webkit-transition: -webkit-transform 0.1s ease-in-out, width 0.1s ease-in-out;
          -moz-transition: -moz-transform 0.1s ease-in-out, width 0.1s ease-in-out;
          -o-transition: -o-transform 0.1s ease-in-out, width 0.1s ease-in-out;
          transition: transform 0.1s ease-in-out, width 0.1s ease-in-out;
        }

        .content-wrapper, .right-side, .main-footer {
          -webkit-transition: -webkit-transform 0.1s ease-in-out, margin 0.1s ease-in-out;
          -moz-transition: -moz-transform 0.1s ease-in-out, margin 0.1s ease-in-out;
          -o-transition: -o-transform 0.1s ease-in-out, margin 0.1s ease-in-out;
          transition: transform 0.1s ease-in-out, margin 0.1s ease-in-out;
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
          -webkit-animation-duration: 0.1s;
          animation-duration: 0.1;
          scale: both;
          animation-fill-mode: unset;
        }
      `;
      utils.paste(globalStyle);
  };

  const applyTableauStyles = () => {
      const tableauStyle = `
        .dataTables_wrapper .dataTables_paginate .paginate_button.disabled, .dataTables_wrapper .dataTables_paginate .paginate_button.disabled:hover, .dataTables_wrapper .dataTables_paginate .paginate_button.disabled:active {
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
        #table_e_materiel_pa_paginate {
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

  const setupFloatingPagination = () => {
      const checkExist = setInterval(() => {
          const paginateContainer = document.querySelector('#table_e_materiel_pa_paginate');
          if (paginateContainer) {
              clearInterval(checkExist);
              createMovablePaginationButton(paginateContainer);
          }
      }, 100);
  };

  const createMovablePaginationButton = (paginateContainer) => {
      // Crée un bouton pour déplacer la pagination
      const moveButton = document.createElement('li');
      moveButton.classList.add('paginate_button', 'move_button');
      moveButton.innerHTML = '<a href="#" style="cursor: grab;">&#8592;</a>';
      setTimeout(function () {
        paginateContainer.querySelector('ul').appendChild(moveButton);
      }, 520);
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
      $(document).ready(() => {
          disableScrollEvents();
          disableFixedHeader();
          setupColumnResizing();
          setupFilterInputHighlighting();
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

      const dtable = $dataTable.DataTable();
      $dataTable.css('table-layout', 'fixed');

      try {
          dtable.columns().every(function() {
              const $header = $(this.header());
              // Only apply min-width if the column header exists
              if ($header.length) {
                  $header.css({
                      'min-width': '50px',
                      'overflow': 'hidden',
                      'text-overflow': 'ellipsis'
                  });
              }
          });
          // Adjust column widths after initialization
          dtable.columns.adjust();
      } catch (error) {
          console.error('Error in column resizing:', error);
      }
  };

  const setupFilterInputHighlighting = () => {
      $(document)
          .off('keyup', '.filter-input')
          .on('keyup', '.filter-input', function() {
              $(this).css('background-color',
                  $(this).val().length ? '#FFDC00' : 'lightblue'
              );
          });
  };

  // Initialize script
  init();
})();