import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { login, register } from '../services/auth';
import { getPostBySlug, getAllPosts } from './blogPosts';

function BlogPost() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const allPosts = getAllPosts();

  // Update page title and meta tags
  useEffect(() => {
    if (post) {
      document.title = `${post.title} - Hermes Mail Blog`;

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = post.description;

      // Update Open Graph tags
      const ogTags = {
        'og:title': post.title,
        'og:description': post.description,
        'og:type': 'article',
        'og:url': `https://hermes-mail.com/blog/${post.slug}`,
      };

      Object.entries(ogTags).forEach(([property, content]) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.content = content;
      });
    }
  }, [post]);

  // Get related posts (excluding current)
  const relatedPosts = allPosts
    .filter(p => p.slug !== slug)
    .slice(0, 3);

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-8">The blog post you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/blog')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Hermes" className="h-16 w-16" />
            <span className="text-xl font-semibold text-white">Hermes Mail</span>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/about')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="text-sm text-white font-medium"
            >
              Blog
            </button>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={login}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={register}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <article className="max-w-4xl mx-auto px-6 py-20">
          {/* Back Button */}
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </button>

          {/* Post Header */}
          <header className="mb-12">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm px-3 py-1 rounded-full bg-slate-800 text-gray-400 border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  HT
                </div>
                <span>{post.author}</span>
              </div>
              <span className="text-slate-600">•</span>
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="text-slate-600">•</span>
              <span>{post.readTime}</span>
            </div>
          </header>

          {/* Post Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-white mt-12 mb-6">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mt-10 mb-4">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-white mt-8 mb-3">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-300 leading-relaxed mb-6">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6 ml-4">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-6 ml-4">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-300">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-6 my-6 italic text-gray-400">
                    {children}
                  </blockquote>
                ),
                code: ({ inline, children }) => (
                  inline ? (
                    <code className="bg-slate-800 text-blue-400 px-2 py-0.5 rounded text-sm">{children}</code>
                  ) : (
                    <code className="block bg-slate-800 p-4 rounded-lg text-sm overflow-x-auto mb-6">{children}</code>
                  )
                ),
                pre: ({ children }) => (
                  <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto mb-6">{children}</pre>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-semibold">{children}</strong>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                hr: () => (
                  <hr className="border-slate-700 my-12" />
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full border-collapse border border-slate-700">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-slate-700 bg-slate-800 px-4 py-2 text-left text-white">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="border border-slate-700 px-4 py-2 text-gray-300">{children}</td>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Share Section */}
          <div className="mt-16 pt-8 border-t border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">Share this article</h3>
            <div className="flex gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://hermes-mail.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://hermes-mail.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(`https://hermes-mail.com/blog/${post.slug}`)}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                title="Copy link"
              >
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 py-20">
              <h2 className="text-2xl font-bold text-white mb-8">More Articles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <article
                    key={relatedPost.slug}
                    onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      {relatedPost.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{relatedPost.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to transform your inbox?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Experience AI-powered email management with Hermes. Start your free trial today.
              </p>
              <button
                onClick={register}
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <img src="/logo.png" alt="Hermes" className="h-5 w-5 opacity-50" />
                <span>Hermes Mail</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <button
                  onClick={() => navigate('/terms')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </div>
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Hermes. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.description,
          "datePublished": post.date,
          "dateModified": post.date,
          "author": {
            "@type": "Organization",
            "name": post.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "Hermes Mail",
            "logo": {
              "@type": "ImageObject",
              "url": "https://hermes-mail.com/logo.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://hermes-mail.com/blog/${post.slug}`
          }
        })
      }} />
    </div>
  );
}

export default BlogPost;
