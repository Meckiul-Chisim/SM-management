import { useEffect } from 'react'
import { PRODUCT_NAME } from '../app/navigation.js'

// Sets the browser tab title for a page ("Calendar · Haven"). Screen reader users
// hear it when navigating, and it makes tabs and history easier to tell apart.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${PRODUCT_NAME}` : `${PRODUCT_NAME} — Social media workspace`
  }, [title])
}
