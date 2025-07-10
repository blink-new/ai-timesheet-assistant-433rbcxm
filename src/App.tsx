import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Send, Bot, User } from 'lucide-react'
import CalendarGrid from '@/components/CalendarGrid'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface TimeSlot {
  hour: number
  minute: number
}

interface CalendarEntry {
  id: string
  startTime: TimeSlot
  endTime: TimeSlot
  title: string
  color: string
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

const initialEntries: CalendarEntry[] = []

function App() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>(initialEntries)
  const [currentDate] = useState(new Date(2024, 6, 9)) // July 9, 2024 (Wed)

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
    
    // Simulate AI response
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

  const handleEntryCreate = (entry: Omit<CalendarEntry, 'id'>) => {
    const newEntry: CalendarEntry = {
      ...entry,
      id: Date.now().toString()
    }
    setCalendarEntries(prev => [...prev, newEntry])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-[1600px] mx-auto h-[calc(100vh-2rem)] flex gap-6">
        {/* Chat Panel */}
        <Card className="flex flex-col w-[400px] shadow-xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Bot className="h-6 w-6" />
              AI Timesheet Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 bg-white">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex items-start gap-3 max-w-[85%] ${
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
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <div className="p-6 bg-white">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about your timesheet..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
                <Button 
                  onClick={handleSendMessage} 
                  className="bg-blue-500 hover:bg-blue-600 rounded-xl px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Panel */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-[520px] h-[600px]">
            <CalendarGrid
              date={currentDate}
              entries={calendarEntries}
              onEntryCreate={handleEntryCreate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App