import { usePreferencesStore } from '../stores/preferencesStore'
import { useLangStore } from '../stores/langStore'

/**
 * Hook retournant des fonctions de formatage réactives
 * qui respectent la devise et le format de date choisis par l'utilisateur.
 */
export const useFormatters = () => {
  const { currency, dateFormat } = usePreferencesStore()
  const { lang }                 = useLangStore()

  // La locale numérique suit la langue de l'interface
  const numLocale = lang === 'en' ? 'en-US' : 'fr-FR'

  /**
   * Montant complet avec décimales (ex : 1 234,00 €)
   */
  const formatAmount = (cents: number): string =>
    new Intl.NumberFormat(numLocale, { style: 'currency', currency }).format(cents / 100)

  /**
   * Montant compact sans décimales (ex : 1 234 €) — pour dashboards/widgets
   */
  const formatAmountShort = (cents: number): string => {
    const symbol = new Intl.NumberFormat(numLocale, { style: 'currency', currency, maximumFractionDigits: 0 })
      .format(0)
      .replace(/[\d\s,.\u00a0]/g, '')
      .trim()
    const number = (cents / 100).toLocaleString(numLocale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    // Place le symbole selon la locale (€ après en FR, $ avant en US)
    return numLocale === 'fr-FR' ? `${number} ${symbol}` : `${symbol}${number}`
  }

  /**
   * Date courte pour les listes (ex : 3 avr. / Apr 3 / 2024-04-03)
   */
  const formatDate = (iso: string): string => {
    const d = new Date(iso)
    if (dateFormat === 'YYYY-MM-DD') return iso.slice(0, 10)
    if (dateFormat === 'MM/DD/YYYY') return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  /**
   * Date longue complète selon le format choisi (ex : 03/04/2024)
   */
  const formatDateFull = (iso: string): string => {
    const d   = new Date(iso)
    const day = String(d.getDate()).padStart(2, '0')
    const mon = String(d.getMonth() + 1).padStart(2, '0')
    const yr  = d.getFullYear()
    if (dateFormat === 'MM/DD/YYYY') return `${mon}/${day}/${yr}`
    if (dateFormat === 'YYYY-MM-DD') return iso.slice(0, 10)
    return `${day}/${mon}/${yr}`
  }

  return { formatAmount, formatAmountShort, formatDate, formatDateFull, currency, numLocale }
}
