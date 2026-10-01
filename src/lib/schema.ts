// JSON-LD @graph della landing (spec F.3). Valori da site.mjs, FAQ dalle stesse funzioni della pagina.
// Identico su / e su /v/<slug>/.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_URL, SITE_NAME, SEO, SOCIAL, AZIENDA, BRAND, DM_URL, SITE_PUBLISHED, SITE_UPDATED, PERCORSO_ALPHA_URL } from '../data/site.mjs';
import { CONFERME as C } from '../data/conferme.mjs';
import { faqPubblicate } from '../data/pagina';

const U = `${SITE_URL}/`;
const ORG = 'https://percorsoalpha.com/#organization';
const ID = {
  website: `${U}#website`,
  dany: `${U}#dany`,
  condizione: `${U}#pectus-excavatum`,
  webpage: `${U}#webpage`,
  percorso: `${U}#percorso`,
  domande: `${U}#domande`,
};

/** true se il file esiste in public/ (build lanciata dalla root del progetto). */
function inPublic(percorso: string): boolean {
  try {
    return existsSync(join(process.cwd(), 'public', percorso));
  } catch {
    return false;
  }
}

export function grafoJsonLd(): Record<string, unknown> {
  const organizzazione: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': ORG,
    name: 'Percorso Alpha',
    url: PERCORSO_ALPHA_URL,
    slogan: 'Non è solo fisico. È sicurezza personale.',
    founder: { '@id': ID.dany },
    areaServed: { '@type': 'Country', name: 'Italia' },
  };
  if (C.logoUfficiale && inPublic(BRAND.logoPng)) {
    organizzazione.logo = { '@type': 'ImageObject', url: `${SITE_URL}${BRAND.logoPng}`, width: 512, height: 512 };
  }
  if (AZIENDA.ragioneSociale) organizzazione.legalName = AZIENDA.ragioneSociale;
  if (AZIENDA.partitaIva) organizzazione.vatID = AZIENDA.partitaIva;
  if (AZIENDA.email) organizzazione.email = AZIENDA.email;

  const persona: Record<string, unknown> = {
    '@type': 'Person',
    '@id': ID.dany,
    name: 'Dany Montagnolo',
    alternateName: 'Dany Monta',
    url: U,
    jobTitle: 'Coach di allenamento a corpo libero per il pectus excavatum, fondatore di Percorso Alpha',
    description:
      'Nato con il pectus excavatum e mai operato. Dal 2018 si allena a corpo libero a casa. Dal 2023 aiuta uomini con il petto scavato a renderlo meno visibile con Percorso Alpha.',
    worksFor: { '@id': ORG },
    knowsAbout: [{ '@id': ID.condizione }, 'Allenamento a corpo libero', 'Postura', 'Ricomposizione corporea'],
    sameAs: [SOCIAL.instagram.url, SOCIAL.youtube.url],
  };
  if (C.ritrattoBrand && inPublic(BRAND.ritratto)) persona.image = `${SITE_URL}${BRAND.ritratto}`;

  const pubblico: Record<string, unknown> = { '@type': 'PeopleAudience', healthCondition: { '@id': ID.condizione } };
  if (C.politicaMinori18) pubblico.suggestedMinAge = 18;

  const domande = faqPubblicate().flatMap((g) => g.domande);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': ID.website,
        url: U,
        name: SITE_NAME,
        alternateName: ['Dany Monta Pectus', 'pectus.percorsoalpha.com'],
        inLanguage: 'it-IT',
        publisher: { '@id': ORG },
      },
      organizzazione,
      persona,
      {
        '@type': 'MedicalCondition',
        '@id': ID.condizione,
        name: 'Pectus excavatum',
        alternateName: ['Petto escavato', 'Petto scavato', 'Torace a imbuto'],
        code: { '@type': 'MedicalCode', codeValue: 'Q67.6', codingSystem: 'ICD-10' },
        sameAs: ['https://www.wikidata.org/wiki/Q431168', 'https://it.wikipedia.org/wiki/Petto_escavato'],
      },
      {
        '@type': 'WebPage',
        '@id': ID.webpage,
        url: U,
        name: SEO.title,
        description: SEO.description,
        inLanguage: 'it-IT',
        isPartOf: { '@id': ID.website },
        about: { '@id': ID.condizione },
        mainEntity: { '@id': ID.percorso },
        author: { '@id': ID.dany },
        publisher: { '@id': ORG },
        datePublished: SITE_PUBLISHED,
        dateModified: SITE_UPDATED,
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${SITE_URL}${SEO.ogImage}`,
          width: SEO.ogImageWidth,
          height: SEO.ogImageHeight,
        },
        hasPart: [{ '@id': ID.domande }],
      },
      {
        '@type': 'Service',
        '@id': ID.percorso,
        name: SITE_NAME,
        serviceType: 'Coaching online di allenamento a corpo libero per rendere il pectus excavatum meno visibile',
        description:
          'Percorso di 12 mesi, a casa, senza palestra: tre sessioni a settimana da circa 45 minuti su quattro pilastri (postura, petto in tre zone, respiro, composizione corporea), con la tecnica controllata sui video del cliente. Non sostituisce la valutazione medica nei casi con sintomi a cuore o polmoni.',
        provider: { '@id': ORG },
        areaServed: { '@type': 'Country', name: 'Italia' },
        audience: pubblico,
        availableChannel: {
          '@type': 'ServiceChannel',
          name: 'Messaggio diretto su Instagram con la parola PETTO',
          serviceUrl: DM_URL,
          availableLanguage: 'it',
        },
        offers: {
          '@type': 'Offer',
          url: `${U}#offerta`,
          description: 'Percorso di 12 mesi. Il prezzo viene comunicato dopo la valutazione del caso.',
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': ID.domande,
        url: ID.domande,
        inLanguage: 'it-IT',
        isPartOf: { '@id': ID.website },
        about: { '@id': ID.condizione },
        mainEntity: domande.map((d) => ({
          '@type': 'Question',
          name: d.domanda,
          acceptedAnswer: { '@type': 'Answer', text: d.risposta },
        })),
      },
    ],
  };
}

/** JSON sicuro dentro <script type="application/ld+json">. */
export function jsonLdString(dati: unknown): string {
  return JSON.stringify(dati).replace(/</g, '\\u003c');
}
