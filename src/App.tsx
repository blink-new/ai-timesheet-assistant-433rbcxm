import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Send, Bot, User, Calendar } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'I want to fill in a timesheet for yesterday',
    timestamp: new Date()
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Did you want to tell me which hours were used for which task? Most commonly used are coding and meetings tasks.',
    timestamp: new Date()
  }
]

function App() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'll help you organize your timesheet. What specific tasks did you work on yesterday?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="w-full max-w-[1400px] h-[700px] flex items-center justify-center gap-16">
        {/* Chat Panel */}
        <Card className="flex flex-col w-[340px] h-full shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Bot className="h-5 w-5" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 bg-white rounded-b-lg">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                          message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}
                      >
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <div className="p-4 bg-white rounded-b-lg">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about your timesheet..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Widget */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-[370px] h-[420px] flex items-center justify-center">
            <Card className="w-full h-full shadow-2xl border-0 bg-white/90 rounded-2xl flex flex-col items-center">
              <CardHeader className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-2xl p-5 flex flex-col items-center">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5" />
                  July 9, Wed
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 w-full flex flex-col items-center justify-center p-8">
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="w-full h-64 flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <span className="text-gray-400 text-lg font-medium">No entries for this day</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
