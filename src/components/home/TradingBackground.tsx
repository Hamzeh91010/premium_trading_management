import React, { useEffect, useRef } from 'react'

interface TradingBackgroundProps {
  className?: string
}

export function TradingBackground({ className = '' }: TradingBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Realistic trading chart data
    const lines: Array<{
      points: Array<{ x: number; y: number }>
      color: string
      opacity: number
      speed: number
      fillArea: boolean
      basePrice: number
    }> = []

    // Generate realistic trading price data
    const generateTradingData = (baseY: number, volatility: number) => {
      const points: Array<{ x: number; y: number }> = []
      let currentPrice = baseY
      let trend = Math.random() > 0.5 ? 1 : -1
      let trendStrength = 0.5 + Math.random() * 0.5
      
      for (let x = 0; x <= canvas.width + 200; x += 8) {
        // Simulate realistic price movements
        const randomChange = (Math.random() - 0.5) * volatility
        const trendChange = trend * trendStrength * 0.3
        
        // Occasionally reverse trend (like real markets)
        if (Math.random() < 0.02) {
          trend *= -1
          trendStrength = 0.3 + Math.random() * 0.7
        }
        
        // Apply price change with some momentum
        currentPrice += randomChange + trendChange
        
        // Keep price within reasonable bounds
        const minY = baseY - 150
        const maxY = baseY + 150
        currentPrice = Math.max(minY, Math.min(maxY, currentPrice))
        
        points.push({
          x,
          y: currentPrice
        })
      }
      return points
    }

    // Create multiple trading charts
    const chartConfigs = [
      { baseY: canvas.height * 0.3, color: 'rgba(59, 130, 246, 0.8)', fillArea: true, volatility: 15 },
      { baseY: canvas.height * 0.5, color: 'rgba(16, 185, 129, 0.6)', fillArea: false, volatility: 12 },
      { baseY: canvas.height * 0.7, color: 'rgba(139, 92, 246, 0.6)', fillArea: false, volatility: 18 },
    ]

    chartConfigs.forEach((config, i) => {
      lines.push({
        points: generateTradingData(config.baseY, config.volatility),
        color: config.color,
        opacity: 0.7 + Math.random() * 0.3,
        speed: 0.3 + Math.random() * 0.4,
        fillArea: config.fillArea,
        basePrice: config.baseY
      })
    })

    let animationFrame: number
    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw grid lines (like trading charts)
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)'
      ctx.lineWidth = 1
      
      // Horizontal grid lines
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
      
      // Vertical grid lines
      for (let x = 0; x < canvas.width; x += 80) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      
      time += 0.01

      lines.forEach((line, lineIndex) => {
        const offsetX = time * 30 * line.speed
        
        // Draw filled area for main chart
        if (line.fillArea) {
          ctx.beginPath()
          ctx.globalAlpha = 0.2
          
          let firstPoint = true
          line.points.forEach((point) => {
            const x = point.x - offsetX
            if (x > -50 && x < canvas.width + 50) {
              if (firstPoint) {
                ctx.moveTo(x, canvas.height)
                ctx.lineTo(x, point.y)
                firstPoint = false
              } else {
                ctx.lineTo(x, point.y)
              }
            }
          })
          
          ctx.lineTo(canvas.width, canvas.height)
          ctx.closePath()
          ctx.fillStyle = line.color
          ctx.fill()
        }
        
        // Draw the main trading line
        ctx.beginPath()
        ctx.globalAlpha = line.opacity
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.fillArea ? 3 : 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        line.points.forEach((point, index) => {
          const x = point.x - offsetX
          
          // Only draw points that are visible
          if (x > -50 && x < canvas.width + 50) {
            if (index === 0 || line.points[index - 1].x - offsetX < -50) {
              ctx.moveTo(x, point.y)
            } else {
              ctx.lineTo(x, point.y)
            }
          }
        })
        
        ctx.stroke()

        // Add price points and highlights
        line.points.forEach((point, index) => {
          const x = point.x - offsetX
          
          if (x > -10 && x < canvas.width + 10 && index % 15 === 0) {
            // Highlight significant price points
            const isCurrentPrice = Math.abs(x - canvas.width * 0.8) < 20
            
            ctx.beginPath()
            ctx.arc(x, point.y, isCurrentPrice ? 5 : 2, 0, Math.PI * 2)
            ctx.globalAlpha = isCurrentPrice ? 1 : 0.6
            ctx.fillStyle = line.color
            ctx.fill()
            
            if (isCurrentPrice) {
              // Add glow effect for current price
              ctx.beginPath()
              ctx.arc(x, point.y, 12, 0, Math.PI * 2)
              ctx.globalAlpha = 0.3
              ctx.fillStyle = line.color
              ctx.fill()
            }
          }
        })
      })

      // Add floating data points (like price updates)
      ctx.globalAlpha = 0.4
      for (let i = 0; i < 8; i++) {
        const x = (time * 40 + i * 150) % (canvas.width + 150)
        const y = 50 + Math.sin(time * 0.5 + i) * (canvas.height - 100)
        const size = 2 + Math.sin(time * 2 + i) * 1.5
        
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, 0.4)`
        ctx.fill()
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ filter: 'blur(1px)' }}
    />
  )
}