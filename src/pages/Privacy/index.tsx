import { LegalDocument, P, H3, UL, LI, Note, Term, type LegalSection } from '@/components/legal/LegalDocument'

const CONTACT = 'pawsome.breeding@gmail.com'

const SECTIONS: LegalSection[] = [
  {
    id: 'scope',
    title: 'What this policy covers',
    content: (
      <>
        <P>
          This covers the PawSome website and the accounts, pet profiles, matches, chats and events inside it. It
          describes what we collect, why, who else ends up holding it, and what you can make us do about it.
        </P>
        <P>
          It does not cover other companies' websites you reach from PawSome. If you click through to a vet, a
          breeder's own page or a map provider, you are on their terms from that point on.
        </P>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    content: (
      <>
        <H3>Things you type in</H3>
        <UL>
          <LI>
            <Term>Your account:</Term> name, email address, password (stored only as a bcrypt hash, so nobody at
            PawSome can read it), and optionally a phone number.
          </LI>
          <LI>
            <Term>Your pets:</Term> name, species, breed, age, gender, temperament notes, and photos. You can have up
            to five active pet profiles.
          </LI>
          <LI>
            <Term>Location:</Term> the coordinates you set for a pet, used to work out who is nearby.
          </LI>
          <LI>
            <Term>Messages:</Term> the contents of chats with other owners, plus who sent what and when.
          </LI>
          <LI>
            <Term>Events:</Term> anything you post or RSVP to in the community and events sections.
          </LI>
        </UL>

        <H3>Things collected automatically</H3>
        <UL>
          <LI>
            Standard server logs from our hosting providers: IP address, browser and device type, pages requested, and
            timestamps. These exist so we can find out why something broke.
          </LI>
          <LI>
            Session data: a token that keeps you signed in, and a record of tokens that have been revoked so a logged
            out session stays logged out.
          </LI>
        </UL>

        <Note>
          We do not run advertising trackers, and we do not use third-party analytics that follow you to other sites.
          There is no ad network in PawSome and no data broker receiving anything about you.
        </Note>
      </>
    ),
  },
  {
    id: 'why',
    title: 'Why we use it',
    content: (
      <>
        <P>Each piece of data earns its place by doing a specific job:</P>
        <UL>
          <LI>
            <Term>Running your account:</Term> signing you in, verifying your email address, resetting a forgotten
            password.
          </LI>
          <LI>
            <Term>Matching:</Term> species, breed, age and distance decide which pets you are shown and which owners
            can see yours.
          </LI>
          <LI>
            <Term>Talking:</Term> delivering chat messages and notifying you about new matches and replies.
          </LI>
          <LI>
            <Term>Local context:</Term> turning coordinates into a place name, and showing weather, air quality and
            nearby parks for a planned meetup.
          </LI>
          <LI>
            <Term>Safety:</Term> investigating reports, enforcing the rules in our Terms, and blocking abuse.
          </LI>
          <LI>
            <Term>Keeping it working:</Term> diagnosing errors, and understanding which features get used enough to be
            worth maintaining.
          </LI>
        </UL>
        <P>
          We do not sell your personal data, and we do not share it for anyone else's advertising. This is not a
          promise we intend to quietly revise later; if it ever changes, the change goes at the top of this page with a
          new date and we will email registered users before it takes effect.
        </P>
      </>
    ),
  },
  {
    id: 'visibility',
    title: 'What other people can see',
    content: (
      <>
        <P>
          Worth being precise about, because this is the part people assume rather than check.
        </P>
        <H3>Visible to other signed-in users</H3>
        <UL>
          <LI>Your pet's name, species, breed, age, gender, temperament notes and photos.</LI>
          <LI>Your display name and owner profile.</LI>
          <LI>An approximate distance from the viewer, for example "4.2 km away".</LI>
        </UL>

        <H3>Never shown to other users</H3>
        <UL>
          <LI>
            Your pet's exact coordinates. The public view of a pet deliberately omits latitude and longitude; only
            the distance is calculated and sent, and only you can retrieve the raw coordinates on your own pets.
          </LI>
          <LI>Your email address, phone number and password hash.</LI>
          <LI>Your chats with other owners, which are visible only to the people in them.</LI>
        </UL>

        <Note>
          One honest caveat about photos. Pet photos are stored in a public object storage bucket, which means the
          image URL itself is not secret: anyone holding the direct link can open the picture without signing in. The
          links are long and unguessable, and we never publish them outside the app, but treat a pet photo as
          shareable rather than private, and do not upload anything you would mind a stranger seeing.
        </Note>
      </>
    ),
  },
  {
    id: 'processors',
    title: 'Who else holds your data',
    content: (
      <>
        <P>
          PawSome is a small operation standing on other people's infrastructure. These companies process data on our
          instructions, and each of them holds a specific slice:
        </P>
        <UL>
          <LI>
            <Term>Neon</Term> hosts the PostgreSQL database: accounts, pets, matches, messages, events.
          </LI>
          <LI>
            <Term>Cloudflare R2</Term> stores pet photos.
          </LI>
          <LI>
            <Term>Render</Term> runs the backend server, and <Term>Vercel</Term> serves the website. Both keep
            request logs.
          </LI>
          <LI>
            <Term>Brevo</Term> sends transactional email: verification codes, password resets, welcome messages. They
            receive your email address and the contents of those messages.
          </LI>
          <LI>
            <Term>OpenStreetMap Nominatim</Term> and <Term>Overpass</Term> turn coordinates into place names and find
            nearby parks. <Term>Open-Meteo</Term> returns weather and air quality. These receive an approximate
            location and nothing that identifies you.
          </LI>
        </UL>
        <P>
          We may also disclose data if the law requires it, or where it is genuinely necessary to investigate a threat
          to someone's safety. If we ever receive a legal demand for your data, we will tell you unless we are
          forbidden from doing so.
        </P>
        <P>
          Some of these providers operate servers outside India, so your data may be processed abroad. We pick
          providers that commit to appropriate safeguards, but you should know it leaves the country.
        </P>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    content: (
      <>
        <UL>
          <LI>
            <Term>Your account and pets:</Term> for as long as your account is open.
          </LI>
          <LI>
            <Term>Deleted pets:</Term> deleting a pet marks it inactive and removes it from browsing and matching
            immediately. The record stays in the database so existing chats and matches do not break.
          </LI>
          <LI>
            <Term>Messages:</Term> kept while the conversation exists, so both sides keep their history.
          </LI>
          <LI>
            <Term>Server logs:</Term> retained by our hosting providers on their own schedules, typically a few weeks.
          </LI>
        </UL>
        <P>
          Ask us to delete your account and we will remove your personal data within 30 days, except anything we are
          legally required to hold on to. Messages you sent to other people may remain visible in their copy of the
          conversation, in the same way an email you have sent does not vanish from the recipient's inbox.
        </P>
      </>
    ),
  },
  {
    id: 'rights',
    title: 'Your rights',
    content: (
      <>
        <P>
          Under India's Digital Personal Data Protection Act, 2023, and comparable rules elsewhere, you can ask us to:
        </P>
        <UL>
          <LI>Tell you what personal data we hold about you and who we have shared it with.</LI>
          <LI>Correct anything inaccurate or incomplete.</LI>
          <LI>Delete your data, subject to what we must legally keep.</LI>
          <LI>Withdraw consent you previously gave, which for most features means closing your account.</LI>
          <LI>Nominate someone to exercise these rights on your behalf if you die or become incapacitated.</LI>
        </UL>
        <P>
          Email <Term>{CONTACT}</Term> and we will respond within 30 days. There is no charge. If you are unhappy with
          how we handle a request, you have the right to complain to the Data Protection Board of India.
        </P>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Security, honestly',
    content: (
      <>
        <P>What we do: passwords are hashed with bcrypt and never stored in a readable form. Traffic runs over HTTPS. Sessions use short-lived access tokens with refresh tokens that rotate on use, and signing out adds the old token to a denylist so it cannot be replayed. Photo uploads go straight to storage using single-use signed URLs rather than passing through our server.</P>
        <P>
          What we will not claim: that any of this makes a breach impossible. It does not. If one happens and your data
          is affected, we will tell you and the Data Protection Board promptly rather than quietly.
        </P>
        <P>
          Your part of this is a password you have not reused from another site. Most account compromises are not
          clever attacks on the service, they are a password that leaked somewhere else years ago.
        </P>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    content: (
      <P>
        PawSome is for adults. You must be 18 or older to create an account. We do not knowingly collect data from
        children, and if we find out an account belongs to one, we will delete it. If you believe a child has given us
        their data, email {CONTACT} and we will remove it.
      </P>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    content: (
      <P>
        When this changes we will update the date at the top. For anything that meaningfully affects what we collect
        or who we share it with, we will email registered users before it takes effect, rather than relying on you to
        re-read this page.
      </P>
    ),
  },
  {
    id: 'contact',
    title: 'How to reach us',
    content: (
      <>
        <P>
          Questions, corrections, deletion requests, or a suspicion that something here does not match what the app
          actually does: <Term>{CONTACT}</Term>.
        </P>
        <P>
          A real person reads that inbox. If something in this policy is unclear or looks wrong, telling us is
          genuinely useful.
        </P>
      </>
    ),
  },
]

function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lede="What PawSome collects about you and your pets, who else touches it, and how to get it back or get rid of it."
      lastUpdated="27 July 2026"
      summary={
        <>
          <p>
            We collect what the app needs to work: your account, your pets, roughly where you are so we can find
            matches nearby, and your messages. No advertising trackers, no data brokers, nothing sold.
          </p>
          <p>
            Other users see your pet's profile and an approximate distance. They never see your exact coordinates,
            your email address or your chats.
          </p>
          <p>Ask us to delete your account and we will, within 30 days.</p>
        </>
      }
      sections={SECTIONS}
    />
  )
}

export default PrivacyPage
