import '../styles/contact.css'

const links = [
  {
    label: 'LinkedIn',
    desc: 'Let\'s connect',
    href: 'https://www.linkedin.com/in/ryan-cooper-4218b9153/',
  },
  {
    label: 'GitHub',
    desc: 'See the code',
    href: 'https://github.com/PursDios',
  },
  {
    label: 'Website',
    desc: 'More about me',
    href: 'https://pursdios.github.io/website/index.html',
  },
]

function Contact() {
  return (
    <div className="contact-page">
      <p className="contact-kicker">Get in touch</p>
      <h1 className="contact-headline">I'm Ryan. I built<br />this. I'm available.</h1>
      <p className="contact-intro">
        Meridian is a portfolio project I built while looking for my next role —
        a senior developer with a background in Vue.js and Laravel, now with
        considerably more Go and React under my belt too.
        If you're hiring or just want to say hello, here's where to find me.
      </p>

      <div className="contact-links">
        {links.map(link => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link"
          >
            <div className="contact-link-left">
              <span className="contact-link-label">{link.label}</span>
              <span className="contact-link-desc">{link.desc}</span>
            </div>
            <span className="contact-link-arrow">↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}

export default Contact
