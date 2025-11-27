'use client'

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  image?: string
}

interface TestimonialsProps {
  testimonials: TestimonialCardProps[]
  title?: string
}

function TestimonialCard({ quote, author, role, image }: TestimonialCardProps) {
  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-charcoal/50 to-charcoal/20 border border-charcoal/50 hover:border-hot-pink/50 transition-all duration-300">
      <div className="mb-4 flex">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-neon-lime" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      <p className="font-josefin text-gray-300 mb-6 text-sm md:text-base leading-relaxed italic">
        "{quote}"
      </p>

      <div className="flex items-center">
        {image && (
          <img
            src={image}
            alt={author}
            className="w-12 h-12 rounded-full mr-4 object-cover"
          />
        )}
        <div>
          <p className="font-bold text-white font-supernova">{author}</p>
          <p className="text-gray-400 text-sm font-josefin">{role}</p>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials({ testimonials, title = 'What Our Users Say' }: TestimonialsProps) {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-supernova text-4xl md:text-5xl font-bold text-center text-white mb-16">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}
