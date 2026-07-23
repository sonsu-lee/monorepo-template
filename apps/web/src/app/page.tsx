import { create, props } from '@stylexjs/stylex';
import Image from 'next/image';

const styles = create({
  page: {
    alignItems: 'center',
    backgroundColor: {
      default: '#fafafa',
      '@media (prefers-color-scheme: dark)': '#000',
    },
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    fontFamily: 'var(--font-geist-sans)',
    justifyContent: 'center',
  },
  main: {
    alignItems: 'flex-start',
    backgroundColor: {
      default: '#fff',
      '@media (prefers-color-scheme: dark)': '#000',
    },
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxWidth: '800px',
    paddingBlock: {
      default: '120px',
      '@media (max-width: 600px)': '48px',
    },
    paddingInline: {
      default: '60px',
      '@media (max-width: 600px)': '24px',
    },
    width: '100%',
  },
  logo: {
    filter: {
      default: null,
      '@media (prefers-color-scheme: dark)': 'invert()',
    },
  },
  intro: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    gap: {
      default: '24px',
      '@media (max-width: 600px)': '16px',
    },
    textAlign: 'left',
  },
  introTitle: {
    color: {
      default: '#000',
      '@media (prefers-color-scheme: dark)': '#ededed',
    },
    fontSize: {
      default: '40px',
      '@media (max-width: 600px)': '32px',
    },
    fontWeight: 600,
    letterSpacing: {
      default: '-2.4px',
      '@media (max-width: 600px)': '-1.92px',
    },
    lineHeight: {
      default: '48px',
      '@media (max-width: 600px)': '40px',
    },
    maxWidth: '320px',
    textWrap: 'balance',
  },
  introText: {
    color: {
      default: '#666',
      '@media (prefers-color-scheme: dark)': '#999',
    },
    fontSize: '18px',
    lineHeight: '32px',
    maxWidth: '440px',
    textWrap: 'balance',
  },
  introLink: {
    color: {
      default: '#000',
      '@media (prefers-color-scheme: dark)': '#ededed',
    },
    fontWeight: 500,
  },
  ctas: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: '14px',
    gap: '16px',
    maxWidth: '440px',
    width: '100%',
  },
  cta: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: '128px',
    borderStyle: 'solid',
    borderWidth: '1px',
    cursor: 'pointer',
    display: 'flex',
    fontWeight: 500,
    height: '40px',
    justifyContent: 'center',
    paddingInline: '16px',
    transitionDuration: '200ms',
    width: 'fit-content',
  },
  primary: {
    backgroundColor: {
      default: '#000',
      '@media (prefers-color-scheme: dark)': '#ededed',
      ':hover': {
        default: null,
        '@media (hover: hover) and (pointer: fine)': '#383838',
        '@media (hover: hover) and (pointer: fine) and (prefers-color-scheme: dark)': '#ccc',
      },
    },
    color: {
      default: '#fafafa',
      '@media (prefers-color-scheme: dark)': '#000',
    },
    gap: '8px',
  },
  secondary: {
    backgroundColor: {
      default: null,
      ':hover': {
        default: null,
        '@media (hover: hover) and (pointer: fine)': '#f2f2f2',
        '@media (hover: hover) and (pointer: fine) and (prefers-color-scheme: dark)': '#1a1a1a',
      },
    },
    borderColor: {
      default: '#ebebeb',
      '@media (prefers-color-scheme: dark)': '#1a1a1a',
    },
  },
});

export default function Home() {
  return (
    <div {...props(styles.page)}>
      <main {...props(styles.main)}>
        <Image
          {...props(styles.logo)}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div {...props(styles.intro)}>
          <h1 {...props(styles.introTitle)}>To get started, edit the page.tsx file.</h1>
          <p {...props(styles.introText)}>
            Looking for a starting point or more instructions? Head over to{' '}
            <a
              {...props(styles.introLink)}
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Templates
            </a>{' '}
            or the{' '}
            <a
              {...props(styles.introLink)}
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learning
            </a>{' '}
            center.
          </p>
        </div>
        <div {...props(styles.ctas)}>
          <a
            {...props(styles.cta, styles.primary)}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              {...props(styles.logo)}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            {...props(styles.cta, styles.secondary)}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
