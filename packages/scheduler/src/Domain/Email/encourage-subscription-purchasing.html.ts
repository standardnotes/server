import { safeHtml } from '@standardnotes/common'

export const html = (registrationDate: string, annualPlusPrice: number, annualProPrice: number) => safeHtml`<div>
  <p>Hi there,</p>
  <p>
    We hope you've been finding great use out of Standard Notes. We built Standard Notes to be a secure place for
    your most sensitive notes and files.
  </p>
  <p>
    As a reminder,
    <strong>
      <em>you signed up for the Standard Notes free plan on ${registrationDate}</em>
    </strong>
    Your free account comes with standard features like end-to-end encryption, multiple-device sync, and
    two-factor authentication.
  </p>
  <p>
    If you're ready to advance your usage of Standard Notes, we recommend upgrading to one of our more powerful
    plans.
  </p>
  <ul>
    <li>
      <p>
        <strong>Productivity</strong> <strong>($${annualPlusPrice}/year)</strong> powers up your editing experience with unique
        and special-built note-types for markdown, rich text, spreadsheets, todo, and more.
      </p>
    </li>
    <li>
      <p>
        <strong>Professional</strong> <strong>($${annualProPrice}/year)</strong> gives you all the power of Productivity plus
        100GB of end-to-end encrypted file storage for your private photos, videos, and documents, plus family
        subscription sharing with up to 5 people.
      </p>
    </li>
  </ul>
  <p>
    Professional comes with a 90-day money back guarantee, so if you're not completely satisfied, we're happy to
    refund your full purchase amount.
  </p>
  <p>
    <strong>
      <a href="https://standardnotes.com/plans">Upgrade your plan →</a>
    </strong>
  </p>
  <p>
    <strong>
      <a href="https://standardnotes.com/features">Learn more about the features →</a>
    </strong>
  </p>
  <p>
    <strong>Questions & Answers</strong>
  </p>
  <p>
    <em>How does Standard Notes compare with conventional note-taking apps?</em>
  </p>
  <p>
    Data you store with Standard Notes is encrypted with end-to-end encryption using a key only you know. Because
    of this, we can't read your notes, and neither can anyone else.
  </p>
  <p>
    <em>What kind of notes should I store in Standard Notes?</em>
  </p>
  <p>
    This question can be reframed as: "What shouldn't I store in non-private services?" This would include
    sensitive/sensual data related to your health and wellness, secrets and keys, notes and documents with
    personally identifiable information that, if leaked, would lead to the theft of your identity, and business,
    financial, or legal information which cover non-public or confidential information.
  </p>
  <p>
    <em>Where can I access my notes?</em>
  </p>
  <p>
    Providing you with easy access to your notes and files on all your devices is a key focus for us. We provide
    secure and well-designed applications for your web browser, desktop (macOS, Windows, Linux,) and mobile
    (Android and iOS).
  </p>
  <p>
    <em>I have more questions.</em>
  </p>
  <p>
    We love questions. Head over to our Help page to see if your question is answered there. If not, reply
    directly to this email or send an email to <a href="help@standardnotes.com">help@standardnotes.com</a> and
    we'd be happy to help.
  </p>
</div>
`
