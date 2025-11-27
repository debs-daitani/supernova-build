'use client'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

interface FeatureGridProps {
  features: Feature[]
  columns?: 2 | 3
}

export default function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  const colsClass = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'

  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className={`grid grid-cols-1 ${colsClass} gap-8`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-gradient-to-br from-charcoal/50 to-charcoal/20 border border-charcoal hover:border-hot-pink hover:from-hot-pink/10 hover:to-light-teal/10 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="mb-4 inline-flex p-3 rounded-lg bg-gradient-to-br from-hot-pink/20 to-light-teal/20 group-hover:from-hot-pink/40 group-hover:to-light-teal/40 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="font-supernova text-xl md:text-2xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="font-josefin text-gray-300 text-sm md:text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
