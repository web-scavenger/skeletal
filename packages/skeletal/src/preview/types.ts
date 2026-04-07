export interface PreviewServer {
  port: number
  url: string
  close(): Promise<void>
}
