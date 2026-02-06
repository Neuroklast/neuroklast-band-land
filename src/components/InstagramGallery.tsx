import { useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { InstagramLogo } from '@phosphor-icons/react'

interface InstagramPost {
  id: string
  imageUrl: string
  permalink: string
  caption?: string
}

export default function InstagramGallery() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const promptText = `You are helping to fetch Instagram posts for the NEUROKLAST music artist. Generate 3 realistic placeholder Instagram posts that would appear on a hard techno/industrial music artist's profile. Each post should have:
        - A unique ID
        - A descriptive image URL (use placeholder images that fit the dark/industrial aesthetic)
        - A realistic Instagram permalink
        - A caption related to music production, gigs, or releases
        
        Return ONLY a valid JSON object with this exact structure:
        {
          "posts": [
            {
              "id": "1",
              "imageUrl": "https://images.unsplash.com/photo-1...",
              "permalink": "https://instagram.com/p/...",
              "caption": "..."
            }
          ]
        }
        
        Use dark, moody, industrial-themed images from Unsplash that match the aesthetic. Make the captions authentic to electronic music culture.`

        const result = await window.spark.llm(promptText, 'gpt-4o-mini', true)
        const data = JSON.parse(result)
        
        if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching Instagram posts:', error)
        setPosts([
          {
            id: '1',
            imageUrl: 'https://images.unsplash.com/photo-1571266028243-d220c6ba1d0c?w=800&q=80',
            permalink: 'https://instagram.com/neuroklast_music',
            caption: 'Live set'
          },
          {
            id: '2',
            imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
            permalink: 'https://instagram.com/neuroklast_music',
            caption: 'Studio session'
          },
          {
            id: '3',
            imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
            permalink: 'https://instagram.com/neuroklast_music',
            caption: 'New release'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchInstagramPosts()
  }, [])

  return (
    <section 
      id="instagram" 
      ref={sectionRef}
      className="py-20 px-4 relative"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <InstagramLogo size={32} className="text-primary" weight="fill" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl">Instagram</h2>
          </div>
          <p className="text-muted-foreground">
            Follow us for the latest updates
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="aspect-square bg-card animate-pulse rounded-md"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {posts.map((post, index) => (
              <motion.a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-md bg-card"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption || 'Instagram post'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 text-white">
                      <InstagramLogo size={20} weight="fill" />
                      <span className="text-sm line-clamp-2">{post.caption}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 transition-colors duration-300 rounded-md" />
              </motion.a>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <a
            href="https://instagram.com/neuroklast_music"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <InstagramLogo size={20} weight="fill" />
            <span className="text-sm tracking-wider">@neuroklast_music</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
