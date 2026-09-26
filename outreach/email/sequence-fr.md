# Séquence de prospection (France, français)

**Règles.** Mêmes règles que la version anglaise :
- moins de 90 mots ;
- texte brut ;
- aucun lien dans l'email 1 ;
- vouvoiement ;
- signature avec le vrai nom du fondateur.

**Base légale.** Prospection B2B par email autorisée si l'offre est en rapport avec la profession du destinataire (CNIL). Chaque email doit :
- informer de l'origine des données ;
- offrir une opposition simple.

Formulation à valider par un avocat.

**Pied de page (chaque email)**
```
{{sender_name}}, {{company}}
{{postal_address}}
Vos coordonnées proviennent de votre fiche Google publique et de votre site. Vos droits : {{privacy_url}}
Pas intéressé ? Répondez « stop » et je ne vous écrirai plus.
```

---

## Email 1 : J0 (sans lien)

**Objet (test A/B) :**
- `{{business_name}} sur Google Maps`
- `votre fiche Google, en un coup d'œil`

```
Bonjour {{first_name}},

J'ai regardé la fiche Google de {{business_name}} cette semaine. Trois choses m'ont frappé :

- {{finding_1}}
- {{finding_2}}
- {{finding_3}}

{{tailored}}

J'ai préparé une maquette de votre fiche corrigée : catégories, description, plan photo, et même une réponse à votre dernier avis. Voulez-vous que je vous l'envoie ?

{{sender_first_name}}
```

---

## Email 2 : J+3 (un lien)

**Objet :** même fil (`Re:`)

```
Bonjour {{first_name}}, la voici, sans engagement :

{{audit_url}}

Vous y verrez votre fiche aujourd'hui, à côté de ce qu'elle serait une semaine après notre intervention, et nos publications du premier mois.

Si elle vous plaît, un bouton « oui » vous attend sur la page. {{price}} HT/mois, sans engagement, et vous restez toujours propriétaire de votre fiche.

{{sender_first_name}}
```

---

## Email 3 : J+7 (sans lien), selon le segment

### A. En retard sur les avis

**Objet :** `{{review_count}} avis contre {{competitor_1_reviews}}`

```
Bonjour {{first_name}},

{{business_name}} a {{review_count}} avis Google. {{competitor_1}} en a {{competitor_1_reviews}}.

L'écart vient rarement de la qualité : la plupart des clients satisfaits n'y pensent simplement pas. Nous envoyons à chaque client la même courte demande après sa visite, et vous fournissons un présentoir pour le comptoir. Aucune récompense, aucun filtre.

Intéressé ? Tout est dans l'audit envoyé le {{email2_day}}.

{{sender_first_name}}
```

### B. Fiche non revendiquée

**Objet :** `votre fiche Google n'est pas revendiquée`

```
Bonjour {{first_name}},

La fiche Google de {{business_name}} n'est pas encore revendiquée. N'importe qui peut donc suggérer des changements d'horaires, de téléphone ou d'adresse, et vous ne pouvez pas répondre aux avis.

La revendiquer est gratuit. Je peux vous guider en 10 minutes, même si vous ne devenez jamais client. Ça vous dit ?

{{sender_first_name}}
```

---

## Email 4 : J+14 (clôture)

**Objet :** `je supprime votre audit ?`

```
Bonjour {{first_name}},

Je comprends que ce n'est pas le moment. Votre page d'audit reste en ligne jusqu'au {{expiry_date}}, puis je la supprimerai.

Si le moment est mieux choisi plus tard, répondez « plus tard » et je reviendrai vers vous dans 3 mois. Belle continuation à {{business_name}}.

{{sender_first_name}}
```

**Note :** l'angle « Ask Maps » (variante C en anglais) n'est pas utilisé en France tant que le lancement de la fonctionnalité n'y est pas confirmé.
