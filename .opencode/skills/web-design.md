---
name: web-design
description: Defineix les normes d'estètica, usabilitat i accessibilitat per a la interfície.
---

# Normes de Disseny Web

Aquest skill defineix les normes d'estètica, usabilitat i accessibilitat que s'han de seguir durant tot el desenvolupament de la interfície.

## Principis Generals

L'aplicació ha de tenir una estètica moderna, neta i professional, inspirada en les interfícies d'aplicacions d'escriptori actuals.

### Evitar

- Estils excessivament decoratius
- Gradients innecessaris
- Ombres exagerades
- Aparença de plantilla genèrica
- Contenidors i targetes innecessaris

## Tipografia

### Font Principal

Utilitza **Geist Sans** com a tipografia principal.

### Escala Tipogràfica

- Utilitza una escala tipogràfica reduïda i consistent
- Diferencia la jerarquia principalment mitjançant mida, pes i espaiat
- Evita utilitzar molts pesos diferents
- Prioritza la llegibilitat

### Fonts Monoespai

Utilitza una font monoespai només per:

- URLs
- Identificadors
- Fragments de codi
- Informació tècnica

## Icones

### Lucide Icons

Utilitza **Lucide Icons**.

- Mantén un únic estil d'icones
- Prioritza icones lineals i simples
- Mantén gruix i mida coherents
- No barregis Lucide amb emojis o altres biblioteques
- Les icones no han de substituir textos quan l'acció pugui resultar ambigua
- Els botons exclusivament amb icona han de tenir una etiqueta accessible

## Recursos

- Utilitza Geist Sans i Lucide com a recursos locals o dependències del projecte
- Evita dependre de CDNs externs

## Paleta

### Base Clara

| Element | Color |
|---------|-------|
| Fons principal | `#F8FAFC` / `#FFFFFF` |
| Superfícies | `#FFFFFF` |
| Vores | `#E2E8F0` |
| Text principal | `#0F172A` |
| Text secundari | `#64748B` |
| Accent | `#2563EB` |
| Accent hover | `#1D4ED8` |

### Colors Semàntics

| Estat | Color |
|-------|-------|
| PASS | `#16A34A` |
| FAIL | `#DC2626` |
| NEEDS_REVIEW | `#D97706` |
| Informació | `#2563EB` |

> **Important:** No utilitzis mai el color com a única manera de comunicar un estat.

## Prioritats

Prioritza sempre, en aquest ordre:

1. **Usabilitat**
2. **Accessibilitat**
3. **Simplicitat**
4. **Consistència**
5. **Estètica**

## Revisió Visual

Inclou una checklist breu per comprovar:

- [ ] Consistència visual
- [ ] Contrast i llegibilitat
- [ ] Responsive
- [ ] Formularis
- [ ] Errors
- [ ] Estats de càrrega
- [ ] Èxit i error
- [ ] Focus visible
- [ ] Navegació amb teclat
- [ ] Accessibilitat bàsica

