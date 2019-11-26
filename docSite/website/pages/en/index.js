/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')

const MarkdownBlock = CompLibrary.MarkdownBlock /* Used to read markdown */
const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props
    const {baseUrl, docsUrl} = siteConfig
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`
    const langPart = `${language ? `${language}/` : ''}`
    const docUrl = doc => `${baseUrl}${docsPart}${doc}`

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    )

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    )

    const ProjectTitle = () => (
      <div>
        <h2 className="projectTitle">{siteConfig.title}</h2>
        <div className="projectTaglineWrapper">
          <p className="projectTagline">{siteConfig.tagline}</p>
        </div>
      </div>
    )

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    )

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    )

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/wire-big.png`} />
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={docUrl('getting-started')}>Get Started</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    )
  }
}

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props
    const {baseUrl} = siteConfig

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}
      >
        <GridBlock
          align={props.align || 'center'}
          imageAlign={props.imageAlign || 'center'}
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    )

    const Wiring = () => (
      <React.Fragment>
        <Block background={'light'} align="left">
          {[
            {
              title: '',
              content:
                '## Readable, intuitive tests \n While `react-testing-library` does a great job of letting you test code the way you use it, getting there requires a lot of so called "wiring" code.  \n While querying for elements, triggering events and then asserting expected values is easy to do, it ends up requiring a lot of repeated code that muddies up your tests.  `react-wiring-library` lets you offload all of that wiring to the framework, leaving behind a single call for each step you want to test.',
              image: `${baseUrl}img/wiring.gif`,
              imageAlt: 'The problem (picture of a maze)',
              imageAlign: 'right',
            },
          ]}
        </Block>
      </React.Fragment>
    )

    const Snapshots = () => [
      <Block background={null} align="left">
        {[
          {
            title: '',
            image: `${baseUrl}img/snapshots.gif`,
            imageAlign: 'left',
            imageAlt: 'The solution (picture of a light bulb)',
            content:
              '## Custom Serializers \n No more massive snapshots that output unreadable diffs and cause unnecessary test failures. Instead, use our simple API for converting DOM elements into easy to read strings that capture the relevant details of your components and nothing more.',
          },
        ]}
      </Block>,
    ]

    const Features = () => (
      <Block layout="threeColumn">
        {[
          {
            content:
              'Assert an entire component with a single call. You be sure being sure that tests only fail when functionality is broken, and know exactly what went wrong.',
            image: `${baseUrl}img/snapshot.png`,
            imageAlign: 'top',
            title: 'Snapshots that work',
          },
          {
            content:
              "Test complicated multi-level components without creating mountains of wiring code that's hard to understand and annoying to maintain.",
            image: `${baseUrl}img/query.png`,
            imageAlign: 'top',
            title: 'Super-charged querying',
          },
          {
            content:
              "Customize the core API of `react-testing-library` without compromising it's guiding principles.",
            image: `${baseUrl}img/customize.png`,
            imageAlign: 'top',
            title: 'Principled Customization',
          },
        ]}
      </Block>
    )

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          <Wiring />
          <Snapshots />
        </div>
      </div>
    )
  }
}

module.exports = Index
