import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Construction } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description: string
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      </div>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Construction className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            This feature is currently under development. We're working hard to bring you 
            the best possible experience.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}