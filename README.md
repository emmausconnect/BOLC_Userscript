# BOLC_Userscript
Un userscript ayant pour but d'améliorer le site du BOLC et ses fonctionnalités.

# Fonctionnalités de ce script 

## Tableau
  - Pagination flottante, pour facilement changer de page.
  - La pagination flottante est déplaçable de gauche à droite en cas d'occlusion d'un élèment.
  - Optimise les pages ayant des tableaux pour qu'elles utilisent tout l'espace disponible en minimisant le padding et la marge.
  - Réduit le padding des cases dans les tableaux pour optimiser l'espace.  
  - Ajoute white-space: nowrap et overflow: hidden aux cases des tableaux.
  - Ajoute plus d'options dans le menu déroulant pour afficher plus d'éléments : 1000, 2000, 3000, 5000 et 10K.  
  - Ajoute la possibilité de réduire la taille des colonne plus petites que ce qui est normalement autorisé.
  - Autorise le réajustement de la largeur des colonnes même quand cela est normalement bloqué.
  - Bloque l'affichage de l'entête sticky du tableau, pendant le défilement, pour éviter divers bugs. 
  - ~~Réduit les éléments du header à 10 caractères, puis ajoute une ellipsis (…) pour optimiser la taille prise en hauteur.~~  

## Changement globaux
  - Réduit la taille de la police de manière globale ainsi que dans les tableaux pour optimiser l'espace.
  - Réduit la taille du header qui prend trop de place en hauteur à l'origine.
  - Réduit la largeur de la sidebar.
  - Augmente le contraste des menus de la sidebar lorsqu'elle est pliée (au survol).
  - Supprime tous les délais d'animation.

# Bugs connus
  - Réajuster la largeur d'une colonne à la fin du tableau fait bouger la vue vers la gauche.  
  - Problème de contraste au survol des URL et des emails bleus.  
  - (Bug de Newmips) Le bouton "Suivant" ne fonctionne pas après la deuxième page.

# Aperçu

Video de la pagination flottante

_Toujours disponible et visible, elle peut être déplacée momentanément en cas de gêne._
![shot on 2024-November-22@21h55(03)](https://github.com/user-attachments/assets/0f54edca-f2ba-410a-9801-eb23989df28d)


Video  
![shot on 2024-November-22@21h04(23)](https://github.com/user-attachments/assets/567cf31a-3e81-49b3-a41b-23fa385b0549)  


Avant 
![389043988-d68793bb-0398-4c97-bd38-bb82627a633a](https://github.com/user-attachments/assets/67bc46d6-5f7f-4b69-af9d-528aa8fe0e57)


Après
![389043975-fc047b45-06c6-4080-ad70-e3a9506016af](https://github.com/user-attachments/assets/ddbcfd85-1dd1-4a21-86d8-e7f1ea2933b8)


# Installation

Installer sur le navigateur une extension gestionnaire d'userscripts tel que Violentmonkey où Tampermonkey.  

Puis [Cliquer-ici](https://raw.githubusercontent.com/emmausconnect/BOLC_Userscript/refs/heads/main/BOLC_Userscript.user.js) pour installer l'userscript. 

