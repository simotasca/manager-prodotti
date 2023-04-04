import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Certificazioni - EuK</title>
        <meta name='description' content='Certificazioni Euk' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
