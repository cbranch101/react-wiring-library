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
    console.log(baseUrl, docsUrl)
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

    const Problem = () => (
      <React.Fragment>
        <Block background={'light'} align="left">
          {[
            {
              title: '',
              content:
                '## The Problem \n - You love the new api provided by `react-testing-library`, but have hit some walls in trying to write tests for your actual components.  Testing individual behaviors is easy and makes a ton of sense, but when it comes to confirming that every you expect has rendered in to the dom, you seem stuck between asserting countless values, or snapshotting the entire dom(the problems of which are well document here) \n - The `react-testing-library` model of calling render to get helpers that are specifically targeted at the component you want to test works great for a single test, but when you try reuse that behavior between multiple tests, it becomes really cumbersome and hard to manage.',
              image: `${baseUrl}img/problem.png`,
              imageAlt: 'The problem (picture of a maze)',
              imageAlign: 'left',
            },
          ]}
        </Block>
      </React.Fragment>
    )

    const Solution = () => [
      <Block background={null} align="left">
        {[
          {
            title: '',
            image: `${baseUrl}img/idea.png`,
            imageAlign: 'right',
            imageAlt: 'The solution (picture of a light bulb)',
            content:
              '## The Solution \n `react-wiring-library` is a declarative framework for describing the relevant structure of the components you want to test.  Once you have your components described using simple tree structure, you can create readable, relevant snapshots that capture every value you care about in a single assert.  It also lets you create a simple api of reusable interactions functions that scale with your tests. ',
          },
        ]}
      </Block>,
    ]

    const Features = () => (
      <Block layout="twoColumn">
        {[
          {
            content:
              'Get all of ease of use of snapshots while eliminating the downsides',
            image: `${baseUrl}img/picture.png`,
            imageAlign: 'top',
            title: 'Readable, Relevant Snapshots',
          },
          {
            content:
              'Easily share test interactions between tests or the suite as a whole',
            image: `${baseUrl}img/recycle.png`,
            imageAlign: 'top',
            title: 'Easy reuse',
          },
          {
            content:
              'Let `react-wiring-library` handle all of the details of traversing the dom, while you focus on what you actually want to test',
            image: `${baseUrl}img/connect.png`,
            imageAlign: 'top',
            title: 'Structure, not details',
          },
        ]}
      </Block>
    )

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          <Problem />
          <Solution />
        </div>
      </div>
    )
  }
}

module.exports = Index
