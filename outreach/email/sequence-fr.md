# Séquence email (France, français)

Les emails tournent en parallèle des appels Bland (voir [docs/04-outbound-engine.md](../../docs/04-outbound-engine.md), section 6).

**Règles (délivrabilité)**
- Moins de 90 mots.
- Texte brut.
- Email 1 sans lien ni image.
- Vouvoiement.
- Signature avec le vrai nom du fondateur.

**Pied de page (chaque email)**
```
{{sender_name}}, {{company}}
{{postal_address}}
Pas intéressé ? Répondez « stop » et je ne vous écrirai plus.
```

---

## Email 1 : J0 (sans lien)

**Objet (test A/B)**
- `{{business_name}} sur Google Maps`
- `votre fiche Google dans 90 jours`

```
Bonjour {{first_name}},

J'ai regardé la fiche Google de {{business_name}} cette semaine. Trois choses m'ont frappé :

- {{finding_1}}
- {{finding_2}}
- {{finding_3}}

{{tailored}}

J'ai préparé votre fiche telle qu'elle serait après 90 jours avec nous : environ {{reviews_projected}} avis, de vraies photos, des publications chaque semaine. Voulez-vous que je vous l'envoie ?

{{sender_first_name}}
```

---

## Email 2 : J+3 (visuel et un lien)

**Objet :** même fil (`Re:`)

```
Bonjour {{first_name}}, la voici : {{business_name}} aujourd'hui, et dans 90 jours.

[card.png]

La version complète, avec votre nouvelle description, vos catégories et vos publications du premier mois : {{audit_url}}

{{price}} HT/mois, sans engagement, et vous restez propriétaire de votre fiche. Un bouton « oui » vous attend sur la page.

{{sender_first_name}}
```

---

## Email 3 : J+7 (sans lien), selon le segment

### A. En retard sur les avis

**Objet :** `{{reviews_today}} avis contre {{competitor_1_reviews}}`

```
Bonjour {{first_name}},

{{business_name}} a {{reviews_today}} avis Google. {{competitor_1}} en a {{competitor_1_reviews}}.

L'écart vient rarement de la qualité : les clients satisfaits n'y pensent pas. Nous installons un présentoir au comptoir, distribuons des cartes et envoyons un SMS après chaque visite. C'est ainsi que vous passez à environ {{reviews_projected}} avis en 90 jours.

Tout est dans la page envoyée le {{email2_day}}.

{{sender_first_name}}
```

### B. Fiche non revendiquée

**Objet :** `votre fiche Google n'est pas revendiquée`

```
Bonjour {{first_name}},

La fiche Google de {{business_name}} n'est pas encore revendiquée. N'importe qui peut modifier vos horaires, votre téléphone ou votre adresse, et vous ne pouvez pas répondre aux avis.

Nous la revendiquons avec vous en 10 minutes, puis nous en faisons une fiche qui attire des clients. Je vous appelle pour le faire ?

{{sender_first_name}}
```

---

## Email 4 : J+14 (clôture)

**Objet :** `je clôture votre dossier ?`

```
Bonjour {{first_name}},

Je comprends que ce n'est pas le moment. Votre page reste en ligne jusqu'au {{expiry_date}}.

Si le moment est mieux choisi plus tard, répondez « plus tard » et je reviendrai vers vous dans 3 mois. Belle continuation à {{business_name}}.

{{sender_first_name}}
```
