import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  lang?: string
}

export async function CodeBlock({ code, lang = 'tsx' }: CodeBlockProps) {
  const html = await codeToHtml(code.trim(), {
    lang,
    theme: 'github-dark',
  })
  return (
    <div
      className="rounded-xl overflow-hidden text-sm [&>pre]:p-5 [&>pre]:overflow-x-auto [&>pre]:leading-relaxed [&>pre]:m-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
