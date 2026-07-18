import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { BotIcon, SparklesIcon } from 'lucide-react'
import { useMemo } from 'react'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '~/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '~/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '~/components/ai-elements/prompt-input'

function App() {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: 'http://localhost:8787/api/chat' }),
    [],
  )
  const { error, messages, sendMessage, status, stop } = useChat({ transport })

  const handleSubmit = async ({ files, text }: PromptInputMessage) => {
    if (!text.trim() && files.length === 0) return

    await sendMessage({ files, text })
  }

  return (
    <main className="flex min-h-svh bg-muted/30 p-3 sm:p-6">
      <section className="mx-auto flex min-h-[calc(100svh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border bg-background shadow-sm sm:min-h-[calc(100svh-3rem)]">
        <header className="flex items-center gap-3 border-b px-5 py-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <SparklesIcon className="size-5" />
          </div>
          <div>
            <h1 className="font-semibold">NeoAI</h1>
            <p className="text-sm text-muted-foreground">
              Mastra memory with Vercel AI Elements
            </p>
          </div>
        </header>

        <Conversation>
          <ConversationContent className="mx-auto w-full max-w-3xl px-5 py-8">
            {messages.length === 0 ? (
              <ConversationEmptyState
                description="Ask a question to start a memory-backed conversation."
                icon={<BotIcon className="size-8" />}
                title="How can I help?"
              />
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, index) => {
                      if (part.type !== 'text') return null

                      return (
                        <MessageResponse key={`${message.id}-${index}`}>
                          {part.text}
                        </MessageResponse>
                      )
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t bg-background p-4 sm:p-5">
          <div className="mx-auto w-full max-w-3xl">
            {error && (
              <p className="mb-3 text-sm text-destructive" role="alert">
                {error.message}
              </p>
            )}
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputTextarea placeholder="Message NeoAI…" />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <span className="px-2 text-xs text-muted-foreground">
                    Enter to send · Shift+Enter for a new line
                  </span>
                </PromptInputTools>
                <PromptInputSubmit onStop={stop} status={status} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
