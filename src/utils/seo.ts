interface MetaOptions {
  title: string
  description: string
}

export const setDocumentMeta = ({ title, description }: MetaOptions) => {
  document.title = title

  const descriptionTag = document.querySelector('meta[name="description"]')
  if (descriptionTag) {
    descriptionTag.setAttribute('content', description)
    return
  }

  const meta = document.createElement('meta')
  meta.name = 'description'
  meta.content = description
  document.head.appendChild(meta)
}
