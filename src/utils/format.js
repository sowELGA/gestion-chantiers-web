export function formatMontant(valeur) {
  return new Intl.NumberFormat("fr-FR")
    .format(valeur)
    .replace(/\u202F|\u00A0/g, " ");
}
