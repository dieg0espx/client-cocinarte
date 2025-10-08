"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { 
  Users, 
  Clock, 
  UserCheck, 
  Calendar, 
  AlertTriangle, 
  Utensils, 
  Gift, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from "lucide-react"

export default function CocinarteFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (id: number) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const faqs = [
    {
      id: 1,
      question: "What ages can participate?",
      answer: "Most classes are designed for kids ages 7–12. We also offer \"Mom & Me / Family\" classes where younger children can join alongside an adult, and specialty workshops for teens or adults.",
      icon: Users,
      color: "cocinarte-blue"
    },
    {
      id: 2,
      question: "Do parents stay during class?",
      answer: "For our \"Mini Chef\" classes, kids are dropped off and guided by our instructors. For \"Mom & Me\" sessions, parents participate in the cooking experience together with their child.",
      icon: UserCheck,
      color: "cocinarte-yellow"
    },
    {
      id: 3,
      question: "How long is each class?",
      answer: "Classes typically run 1.5 to 2 hours, depending on the theme. This includes time to prepare, cook, and enjoy the food.",
      icon: Clock,
      color: "cocinarte-orange"
    },
    {
      id: 4,
      question: "How do I register?",
      answer: "You can sign up directly through our website by selecting the class and date. If a class is full, you'll see an option to join the waitlist.",
      icon: Calendar,
      color: "cocinarte-red"
    },
    {
      id: 5,
      question: "Do you accommodate food allergies?",
      answer: "Yes! Please let us know about any allergies or dietary restrictions at registration. While we do our best to adapt recipes, please note that our kitchen handles common allergens (wheat, dairy, eggs, nuts).",
      icon: AlertTriangle,
      color: "cocinarte-navy"
    },
    {
      id: 6,
      question: "Will my child eat what they make?",
      answer: "Yes! Part of the fun is enjoying the finished dish together. If there are leftovers, kids can take them home to share.",
      icon: Utensils,
      color: "cocinarte-blue"
    },
    {
      id: 7,
      question: "Do you offer birthday parties?",
      answer: "Absolutely. Cocinarte hosts birthday party packages, private group classes, and special workshops. Contact us for custom options.",
      icon: Gift,
      color: "cocinarte-yellow"
    },
    {
      id: 8,
      question: "How much does each class cost?",
      answer: "Pricing varies by class type, but most range from $60–$80 per child for Mini Chef classes and $120–$150 per family for Mom/Dad & Me sessions. Prices include all ingredients and supplies.",
      icon: DollarSign,
      color: "cocinarte-orange"
    }
  ]

  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-cocinarte-blue/5 via-cocinarte-yellow/5 to-cocinarte-orange/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-cocinarte-navy rounded-full text-cocinarte-white text-sm font-semibold mb-6">
            <HelpCircle className="h-5 w-5 mr-2" />
            Get Your Questions Answered
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-medium max-w-3xl mx-auto">
            Everything you need to know about Cocinarte cooking classes for kids and families.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq) => {
              const IconComponent = faq.icon
              const isOpen = openItems.includes(faq.id)
              
              return (
                <Card 
                  key={faq.id} 
                  className={`border-0 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    isOpen ? 'bg-cocinarte-white' : 'bg-white hover:bg-cocinarte-blue/5'
                  }`}
                >
                  <CardContent className="p-0">
                    <button
                      className="w-full p-6 text-left transition-all duration-200 flex items-center justify-between group"
                      onClick={() => toggleItem(faq.id)}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl bg-${faq.color}/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                          <IconComponent className={`h-6 w-6 text-${faq.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate pr-4 group-hover:text-cocinarte-navy transition-colors duration-200">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-cocinarte-navy transition-transform duration-200" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-medium group-hover:text-cocinarte-navy transition-all duration-200" />
                        )}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-slate-medium leading-relaxed text-base">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
