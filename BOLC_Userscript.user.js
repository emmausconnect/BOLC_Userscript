// ==UserScript==
// @name        B0LC / newmips.cloud
// @namespace   BOLC Newmips Patch
// @match       https://lacollecte.newmips.cloud/*
// @match       https://app-emmaus-cloud.newmips.run/*
// @homepageURL https://github.com/emmausconnect/BOLC_Userscript
// @downloadURL https://raw.githubusercontent.com/emmausconnect/BOLC_Userscript/refs/heads/main/BOLC_Userscript.user.js
// @updateUR    https://raw.githubusercontent.com/emmausconnect/BOLC_Userscript/refs/heads/main/BOLC_Userscript.user.js
// @grant       none
// @version     1.1
// @author      Joffrey SCHROEDER / @Write on Github
// ==/UserScript==

(function() {
    'use strict';

    /* ----------------
     *   HELPERS
     * ----------------
     * */
    const isDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? true : false;
    const platform = window.navigator.platform

    const currentPagepath       = window.location.pathname;
    const placeholder           = '📜  BOLC Userscript';
    const log                   = (str) => console.log("" + placeholder + " : " + str + "");
    const theme                 = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    function match(str, rule) {
        var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
    }

    function addScript(text) {
        var newScript = document.createElement('script');
        newScript.type = "application/javascript";
        newScript.textContent = text;
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(newScript);
    }

    function paste(str) {
        var node = document.createElement('style');
        node.type = 'text/css';
        node.appendChild(document.createTextNode(str.replace(/;/g, ' !important;')));
        if (document.head !== null) {
            document.head.appendChild(node);
        }
        else {
            /* No head yet, stick it whereever */
            document.documentElement.appendChild(node);
        }
    }

    const checkElement = async selector => {
        while (document.querySelector(selector) === null) {
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
        return document.querySelector(selector);
    };

    function removeGarbage(arr) {
      arr.forEach(e => {
              checkElement(e).then((selector) => {
              log('Deleting element -- ' + e);
              selector.remove();
          });
      });
    }

    function clearEventListener(element) {
        const clonedElement = element.cloneNode(true);
        element.replaceWith(clonedElement);
        return clonedElement;
    }

    const current = window.location.href;

    /* ----------------
     *   CODE
     * ----------------
     * */
    if (window.top === window.self) {
        log("(main) Loaded on : " + current)
    }
    else {
        log("(iframe) Loaded on : " + current);
    }
    
    /* 
     * Unused
     * 
     * */
    if (currentPagepath.startsWith("/auth")) {
      style = ``;
      paste(style);
    }

    /*
     *
     * Accélere toutes les animations non css
     *
     * */
    $.AdminLTE.options.animationSpeed = 10;
    $.AdminLTE.tree('.sidebar');
    $('.box').each(function () {
        $.AdminLTE.boxWidget.activate(this);
    });
    $.AdminLTE.boxWidget.activate();

    /*
     *
     * Ajoute plus d'option d'affichage d'elements au menu déroulant.
     *
     * */
    const select = document.querySelector('select[name]');
    const valuesToAdd = [1000, 2000, 3000, 5000, 10000];

    valuesToAdd.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });


    /*
     *
     * Style pour les pages ayant un tableau
     * permettant de maximiser l'espace de l'écran
     * perdu inutilement.
     *
     * */
    const path_with_tableau = ["/materiel_disponible/list", "/materiel_pa/list", "/don/list", "/relais/list", "/reconditionnement/list", "/personne_morale/list"];

    if (path_with_tableau.some(path => currentPagepath.startsWith(path))) {

      let style = `

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

      paste(style);

      /*
       *  Retire le header des tableau en scrollant,
       *  Il est de toute façon trop buggé :
       *  impossible de resize les colonnes pendant le scroll, etc...
       *
       * */

      $(document).ready(function() {
          // Bloquer tous les événements de défilement
          $(document).on('scroll', function(event) {
              event.preventDefault();
              event.stopPropagation();
          });

          // Désactiver le sticky header après chaque changement de page
          $('#table_id').on('page.dt', function() {
              // Cibler spécifiquement l'élément sticky flottant créé par DataTables
              $('.fixedHeader-floating').each(function() {
                  $(this).remove();
              });
          });

          // Optionnel : s'assurer que le sticky ne se réactive pas après le redessin de la table
          $('#table_id').on('draw.dt', function() {
              // Réinitialiser tous les headers flottants
              $('.fixedHeader-floating').each(function() {
                  $(this).remove();
              });
          });
      });


      /*
       *  Autorise le resizing des colonnes sous le minimum possible normalement
       *
       * */

      // Ugly fix pour les 3 boutons à la fin du tableau.
      $('.dataTable th:nth-last-child(-n+3)').css('width', '90px'); // Adjust as needed


      $(document).ready(function() {

          // Check if the DataTable is already initialized
          let dtable = $('.dataTable').DataTable();

          // Ensure the table layout allows resizing and is fixed
          $('.dataTable').css('table-layout', 'fixed');

          // Function to apply column styles
          function applyColumnStyles() {
              dtable.columns().every(function () {
                  const column = this;

                  // Apply minimum width and overflow hidden to headers and cells
                  $(column.header()).css({
                      'min-width': '50px',
                      'overflow': 'hidden',  // Apply overflow hidden to the cells
                      'white-space': 'nowrap'
                  });

                  $(column.nodes()).css({
                      'min-width': '50px',
                      'overflow': 'hidden',  // Apply overflow hidden to the cells
                      'white-space': 'nowrap'
                  });
              });
          }

          // Check if DataTable is initialized, then apply styles
          if ($.fn.dataTable.isDataTable('.dataTable')) {

              // Initial application of styles
              applyColumnStyles();

              // Reapply the styles after each table redraw (e.g., after scrolling)
              dtable.on('draw', function() {
                  applyColumnStyles();
              });

              // Optional: Trigger a redraw to apply any initial changes
              dtable.draw();
          } else {
              console.error('DataTable is not initialized yet');
          }
      });


    }

    /*
     * Style pasted everywhere, regardless.
     *
     * */
    let style = `

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

    paste(style);
    
    /* 
     * Commentaire 
     * Fonctionnalités désactivés
     * Désactivé pour le moment, inutile depuis l'intégration des
     * white-space: nowrap + overflow: hidden
     * */

    /*
     * (Pas utilisé)
     * Strip les elements du header d'un tableau a 10 charactères.
     * Permettant du gain en hauteur dû aux entêtes trop longues.
     *
     * */

    /*
    document.querySelectorAll('thead.main tr.fields th').forEach(th => {
        const text = th.textContent.trim(); // Récupère le contenu textuel
        if (text.length > 10) {
            th.textContent = text.substring(0, 10) + '…'; // Tronque à 10 caractères et ajoute un ellipsis
        }
    });
    */
    
    /*
     *
     * (Pas utilisé)
     * Masque la colonne spécifique "URL Kimovil", car inutile et
     * prend de la place ne h
     *
     * */

    /*
    const path_pc_tableau_masquage_colonne = [ "/materiel_pa/list/1", "/materiel_pa/list" ];
    if (path_pc_tableau_masquage_colonne.some(path => currentPagepath === path)) {
      setTimeout(() => {
          document.querySelectorAll('th[data-field="f_lien_url_description"], td:nth-child(25)').forEach(element => {
              element.style.display = 'none';
          });
      }, 7000);
    }
    const path_tel_tableau_masquage_colonne = ["/materiel_pa/list/2" ];
    if (path_tel_tableau_masquage_colonne.some(path => currentPagepath === path)) {
      setTimeout(() => {
          document.querySelectorAll('th[data-field="f_lien_url_description"], td:nth-child(32)').forEach(element => {
              element.style.display = 'none';
          });
      }, 7000);
    }
    */

})();
