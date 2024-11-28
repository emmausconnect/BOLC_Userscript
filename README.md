# BOLCScript
Un userscript ayant pour but d'améliorer le site du BOLC et ses fonctionnalités.

# Installation

Installer sur le navigateur une extension gestionnaire d'userscripts tel que Violentmonkey où Tampermonkey.  

Pour Firefox : [Violentmonkey](https://addons.mozilla.org/fr/firefox/addon/violentmonkey/) où [Tampermonkey](https://addons.mozilla.org/fr/firefox/addon/tampermonkey/)  
Pour Chrome : [Violentmonkey](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag) où [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=fr&pli=1)  

Puis [Cliquer-ici](https://raw.githubusercontent.com/emmausconnect/BOLC_Userscript/refs/heads/main/BOLC_Userscript.user.js) pour installer l'userscript. 


# Fonctionnalités de ce script 

## Tableau
  - Copie les boutons "Retour" / "Créer" depuis le bas de page vers le haut de la page, quand l'un et/ou l'autre sont dispo.
  - Les textes des cellules sont désormais affichés intégralement sans être tronqués ni remplacés par des points de suspension (exemple : Adresse, Action à effectuer, etc.).
  - Pagination flottante permettant un changement de page simplifié.
  - La pagination flottante peut être déplacée latéralement (de gauche à droite) en cas d'occlusion par un élément.
  - Le bouton "Effacer la recherche" dispose désormais d’un texte pour une meilleure visibilité.
  - Le bouton "Effacer la recherche" ne provoque plus de rechargement de la page lors de l'effacement (uniquement pour les tableaux en plein écran).
  - La page courante (pagination) est maintenant sauvegardée dans le fragment URL, permettant de revenir à la même page après un rafraîchissement.
  - Optimisation de l’espace utilisé par les pages contenant des tableaux en réduisant les marges et les espacements inutiles.
  - Réduction du padding des cellules dans les tableaux pour maximiser l’espace disponible.
  - Ajout des propriétés CSS "white-space: nowrap" et "overflow: hidden" aux cellules des tableaux.
  - Ajout de nouvelles options dans le menu déroulant pour afficher un plus grand nombre d’éléments : 1000, 2000, 3000, 5000 et 10 000.
  - Possibilité de réduire la taille des colonnes au-delà des limites habituellement autorisées.
  - Activation du réajustement de la largeur des colonnes même lorsque cette fonctionnalité est normalement bloquée.
  - ~~Réduit les éléments du header à 10 caractères, puis ajoute une ellipsis (…) pour optimiser la taille prise en hauteur.~~  

## Changements globaux
- Optimiser la largeur de la barre latérale en la réduisant au strict minimum.
- Diminuer la taille de la police de manière globale, y compris dans les tableaux, pour maximiser l’utilisation de l’espace.
- Réduire la hauteur du bandeau supérieur afin de minimiser l’espace occupé.
- Améliorer le contraste des menus de la barre latérale lors du survol, lorsqu’elle est repliée.
- Éliminer tous les délais liés aux animations.

# Bugs connus
  - Réajuster la largeur d'une colonne en bas du tableau provoque un déplacement latéral de la vue vers la gauche.  
  - (Bug de Newmips) Le bouton "Suivant" devient inopérant à partir de la seconde page.
  - ~~Si l'en-tête du tableau n'est pas visible (par exemple, en bas de page), le changement de page via la pagination réinitialise la largeur des colonnes. Elles deviennent alors non interactives (impossible de modifier l'ordre ou la largeur des colonnes). Un rechargement de la page est nécessaire. Ce bug sera corrigé dans les meilleurs délais.~~ (Correctif "temporaire" implémenté : défilement automatique vers le haut lors du changement de page)  
  - ~~Problème de condition de concurrence avec le chargement de la pagination dans le fragment URL.~~  (Corrigé - 1.2.1)
  - ~~Problème de contraste au survol des URL et des emails bleus.~~ (Corrigé)

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



