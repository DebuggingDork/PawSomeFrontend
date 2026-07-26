import { Link } from 'react-router'
import { LegalDocument, P, H3, UL, LI, Note, Term, type LegalSection } from '@/components/legal/LegalDocument'

import { SupportLink } from '@/components/support/SupportLink'

/** Renders the support address as a Gmail compose link, subject already set. */
const Contact = ({ subject }: { subject: string }) => (
  <SupportLink subject={subject} className="text-[#ff6b35] underline-offset-4 transition-colors hover:text-[#ff8c5c] hover:underline" />
)

const SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Agreeing to these terms',
    content: (
      <>
        <P>
          Creating an account, or using PawSome at all, means you accept these terms. If you are using it for a
          kennel, a shelter or any other organisation, you are confirming you have the authority to accept them on
          that organisation's behalf.
        </P>
        <P>
          If you do not agree with something here, the honest answer is not to use the service. We would rather that
          than have you find out later that you disagreed.
        </P>
      </>
    ),
  },
  {
    id: 'eligibility',
    title: 'Who can use PawSome',
    content: (
      <UL>
        <LI>You must be at least 18 years old.</LI>
        <LI>You must give accurate information about yourself and your animals, and keep it current.</LI>
        <LI>One account per person. Do not create a second one to get around a suspension.</LI>
        <LI>You must be legally allowed to keep the animals you list, and able to make decisions about them.</LI>
        <LI>You must not be barred from using the service under any applicable law.</LI>
      </UL>
    ),
  },
  {
    id: 'account',
    title: 'Your account',
    content: (
      <>
        <P>
          You are responsible for what happens under your account, so use a password you have not used anywhere else
          and do not share your sign-in details. Tell us at <Contact subject="Possible account compromise" /> if you think someone else has got in.
        </P>
        <P>
          We ask you to verify your email address before you can start matching. That is not bureaucracy for its own
          sake: an unverified inbox is the cheapest possible fake account, and the whole point of the platform is that
          the person on the other end is real.
        </P>
      </>
    ),
  },
  {
    id: 'your-content',
    title: 'What you post',
    content: (
      <>
        <P>
          Your photos, profiles and messages remain yours. We do not claim ownership of any of it.
        </P>
        <P>
          To actually display them, we need your permission to store and show them: by posting, you give PawSome a
          non-exclusive, worldwide, royalty-free licence to host, resize and display your content inside the service.
          That licence exists solely to run the app, ends when you delete the content or your account, and does not
          let us license your photos to anyone else or use them in advertising.
        </P>
        <P>
          You are confirming that you have the right to post what you post. Do not upload photos you found on the
          internet, including photos of somebody else's dog. It is a fast way to lose your account and, given that the
          entire product is about trust, a fairly pointless thing to do.
        </P>
      </>
    ),
  },
  {
    id: 'conduct',
    title: 'Rules of conduct',
    content: (
      <>
        <P>Do not:</P>
        <UL>
          <LI>Impersonate anyone, or misrepresent your animal's breed, age, health or pedigree.</LI>
          <LI>Harass, threaten, or send unwanted sexual content to other users.</LI>
          <LI>Use PawSome to advertise anything unrelated, run scams, or phish for money or personal details.</LI>
          <LI>
            Use the service in connection with a puppy mill, an unregistered commercial breeding operation, or any
            arrangement that treats an animal as stock.
          </LI>
          <LI>Breed animals in a way that is cruel, or that knowingly passes on a serious hereditary condition.</LI>
          <LI>Scrape, crawl, or bulk-download other users' profiles or photos.</LI>
          <LI>Attempt to break, overload or reverse engineer the service, or probe it for vulnerabilities uninvited.</LI>
        </UL>
        <Note>
          Found a security flaw? We would rather hear about it than not. Email <Contact subject="Security report" /> with what you found and how
          to reproduce it, and give us a reasonable chance to fix it before telling anyone else. We will not come
          after anyone who reports a problem in good faith and does not go digging through other people's data.
        </Note>
      </>
    ),
  },
  {
    id: 'breeding',
    title: 'Breeding, meetups, and what we do not do',
    content: (
      <>
        <P>
          This is the most important section on the page, so it is written plainly rather than in the usual voice of a
          terms document.
        </P>
        <P>
          <Term>PawSome introduces people. That is the entire product.</Term> We are not a breeder, a vet, a kennel
          club, a registry, or a broker. We do not inspect animals, verify pedigree papers, confirm vaccination
          records, assess anyone's premises, or supervise a single meeting arranged through the app.
        </P>

        <H3>What that means for you</H3>
        <UL>
          <LI>
            <Term>Get a vet involved before you breed.</Term> Health screening, genetic testing where the breed calls
            for it, and an honest conversation about whether your animal should be bred at all are your
            responsibility, not something a match implies.
          </LI>
          <LI>
            <Term>Meet in public first.</Term> Meet the other owner and their animal somewhere open, in daylight,
            before anything else happens. Tell someone where you are going.
          </LI>
          <LI>
            <Term>Put the arrangement in writing.</Term> Stud fees, pick of the litter, who pays vet bills, what
            happens if there is no pregnancy: agree it between yourselves, in writing, in advance. PawSome is not a
            party to that agreement and cannot enforce or mediate it.
          </LI>
          <LI>
            <Term>Obey your local law.</Term> In India, dog breeding and sale is regulated under the Prevention of
            Cruelty to Animals (Dog Breeding and Marketing) Rules, 2017, which require breeders to register with their
            State Animal Welfare Board, alongside the Prevention of Cruelty to Animals Act, 1960. Other places have
            their own rules, including licensing and limits on litters. Complying with whatever applies to you is your
            job.
          </LI>
        </UL>

        <P>
          Distances shown in the app are straight-line estimates, not driving directions, and weather and nearby-place
          information comes from third parties who can be wrong. Do not make a decision that matters on the strength
          of a number in a card.
        </P>
      </>
    ),
  },
  {
    id: 'verification',
    title: 'What "verified" actually means',
    content: (
      <>
        <P>
          A verified badge on PawSome means one specific thing: that person clicked a link in an email we sent to the
          address they signed up with. It is a real signal, and it is a low bar.
        </P>
        <P>
          It does not mean we have checked their identity, met their animal, seen a vaccination card, or formed any
          view about whether they are a good person to hand a dog to. Please do not read it as an endorsement,
          because it is not one.
        </P>
      </>
    ),
  },
  {
    id: 'enforcement',
    title: 'Reporting and enforcement',
    content: (
      <>
        <P>
          Report anything that looks wrong to <Contact subject="Reporting a user" />. Include a link or a username and enough detail for us to find
          it.
        </P>
        <P>
          We can remove content, restrict features, or suspend and delete accounts that break these terms. Where it is
          reasonable we will tell you why and give you a chance to respond. Where there is a risk to someone's safety
          or an animal's welfare, we will act first and explain afterwards.
        </P>
      </>
    ),
  },
  {
    id: 'availability',
    title: 'The service will change, and sometimes break',
    content: (
      <>
        <P>
          PawSome is early. Features will be added, changed and occasionally removed. There will be downtime. We do
          not promise the service will be available or error-free, and we provide it "as is", without warranties of
          any kind to the extent the law allows.
        </P>
        <P>
          Keep your own copy of anything you would be upset to lose. That advice applies to every service on the
          internet, and it applies here.
        </P>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Liability',
    content: (
      <>
        <P>
          To the fullest extent permitted by law, PawSome is not liable for anything that happens between you and
          another user: what an animal does, what a person does, disputes over stud arrangements or puppies, injury,
          illness, or money you do not get back. Meetings you arrange are yours, and so are their consequences.
        </P>
        <P>
          We are also not liable for indirect or consequential losses, or for lost profits or lost data. Where
          liability cannot legally be excluded, it is limited to the greater of the amount you have paid us in the
          past twelve months, or one thousand rupees.
        </P>
        <P>
          Nothing here limits liability for death or personal injury caused by our negligence, for fraud, or for
          anything else that cannot lawfully be excluded.
        </P>
      </>
    ),
  },
  {
    id: 'termination',
    title: 'Ending it',
    content: (
      <P>
        You can stop using PawSome and ask us to delete your account at any time by emailing <Contact subject="Account deletion request" />. We can suspend
        or close an account that breaks these terms, or if we stop running the service. The sections that should
        survive the end of this agreement, including content licences already granted, liability and governing law,
        do survive it.
      </P>
    ),
  },
  {
    id: 'law',
    title: 'Governing law and disputes',
    content: (
      <>
        <P>
          These terms are governed by the laws of India. Courts in India have exclusive jurisdiction over any dispute
          arising from them, and you agree to that.
        </P>
        <P>
          Before anyone involves a court, email <Contact subject="Dispute" /> and describe the problem. Most disagreements turn out to be
          a misunderstanding that a conversation fixes faster and more cheaply than a legal process does.
        </P>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <>
        <P>
          Questions about these terms, reports, or requests: <Contact subject="Question about the Terms" />.
        </P>
        <P>
          How we handle the data behind all of this is set out separately in the{' '}
          <Link to="/privacy" className="text-[#ff6b35] underline-offset-4 transition-colors hover:text-[#ff8c5c] hover:underline">
            Privacy Policy
          </Link>
          .
        </P>
      </>
    ),
  },
]

function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Use"
      lede="The agreement between you and PawSome: what you can expect from us, what we expect from you, and who is responsible when animals and strangers meet."
      lastUpdated="27 July 2026"
      summary={
        <>
          <p>
            Be 18 or older, be honest about yourself and your animals, and treat other owners decently. Do not post
            photos that are not yours.
          </p>
          <p>
            PawSome introduces people and does nothing else. We do not check animals, papers or premises. Before you
            breed, talk to a vet. Before you meet, meet in public. Put any arrangement in writing between yourselves.
          </p>
          <p>Indian law governs this agreement.</p>
        </>
      }
      sections={SECTIONS}
    />
  )
}

export default TermsPage
