import { useState, useRef, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { messages } from '@/lib/messages'
import { Send, Bot, User } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: messages.ai.greeting,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSend = async () => {
    if (!input.trim() || isThinking) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setChatMessages(prev => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    // Simulated AI response — in MVP this would call the AI API
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: getPlaceholderResponse(userMessage.content),
        timestamp: new Date(),
      }
      setChatMessages(prev => [...prev, aiResponse])
      setIsThinking(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={messages.ai.title} showMonthNav={false} />

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
            }`}>
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                : 'bg-emerald-600 text-white'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-3.5 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-stone-200 dark:border-stone-700 p-4 bg-white dark:bg-stone-900">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={messages.ai.placeholder}
            className="input flex-1"
            disabled={isThinking}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="btn-primary p-2.5 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-stone-400 text-center mt-2">
          O assistente financeiro usa IA para ajudar com suas finanças. As respostas são sugestões, não aconselhamento financeiro profissional.
        </p>
      </div>
    </div>
  )
}

// Placeholder responses until AI API is integrated
function getPlaceholderResponse(userInput: string): string {
  const lower = userInput.toLowerCase()

  if (lower.includes('parcela') || lower.includes('parcelar')) {
    return 'Para simular parcelas, vá na aba "Parcelas" e use o simulador. Lá você pode ver como fica o comprometimento da sua renda. Quer que eu explique mais?'
  }
  if (lower.includes('salário') || lower.includes('salario') || lower.includes('líquido')) {
    return 'Na aba "Salário" você tem a calculadora de salário líquido com INSS e IRRF. Basta colocar seu bruto que eu calculo tudo!'
  }
  if (lower.includes('conta') || lower.includes('boleto') || lower.includes('pagar')) {
    return 'Suas contas a pagar ficam na aba "Contas a Pagar". Lá você vê os vencimentos e pode marcar como pago. Posso ajudar com algo específico?'
  }
  if (lower.includes('orçamento') || lower.includes('orcamento') || lower.includes('limite')) {
    return 'O orçamento fica na aba "Orçamento" onde você pode definir limites por categoria e acompanhar os gastos em tempo real.'
  }
  if (lower.includes('meta') || lower.includes('reserva') || lower.includes('emergência')) {
    return 'Uma boa reserva de emergência tem entre 3 e 6 meses das suas despesas essenciais. Vá na aba "Metas" para criar a sua!'
  }

  return 'Entendi! Estou aqui pra ajudar com suas finanças. Posso falar sobre orçamento, parcelas, contas a pagar, salário ou metas. O que você precisa?'
}
