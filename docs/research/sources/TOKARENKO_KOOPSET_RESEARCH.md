# What Vitaly Tokarenko proposed in KООПСЕТЬ - source review for FOLKOOP

25 September 2026.

This note separates source-supported KООПСЕТЬ ideas from FOLKOOP design choices. It is not an endorsement of every claim in the source presentations.

## Sources reviewed

1. Strategy24 presentation: "Социально-экономическая платформа КООПСЕТЬ-для нашего трекера М.Крикушиной-мои правки"
   https://storage.strategy24.ru/files/news/202206/5eed2a290e0ea23dd5e10b768f7c9b25.pdf
2. Strategy24 presentation: "Социально-экономическая платформа КООПСЕТЬ"
   https://storage.strategy24.ru/files/community/202206/929512a4e7fbc877d3dd1a2d987c2f4d.pdf
3. MSU Faculty of Economics conference record, 30 October 2022:
   https://www.econ.msu.ru/departments/agro/news/News.20221031175231_1359/
4. Related ecosystem presentation:
   https://cdn.palatalo.ru/Document/1663238470.pdf

The MSU record identifies Vitaly Sergeevich Tokarenko as an economist, IT developer and head of the St Petersburg regional branch of "Leningradskiy gektar", and lists his report "Социально-экономическая платформа КООПСЕТЬ".

## Source-supported architecture

KООПСЕТЬ was presented as a broad socio-economic digital platform rather than a conventional social network.

### One digital information field

The presentation explicitly proposes:
- news, announcements and meeting results;
- documents such as charters, estimates, reports, protocols and tariffs;
- a personal account;
- contribution/debt information and online payment;
- meter readings;
- voting and online/hybrid meetings;
- applications to service/dispatch providers;
- forum and feedback;
- integrations such as 1C and utility/accounting systems.

### Social coordination and local action

The material proposes communication plus joint action around:
- local improvement;
- shared pond, paths, lighting, recreation area and playground;
- cooperative shop;
- joint recreation;
- cooperative education of children.

### Civic decision support

The platform was proposed as a layer for:
- voting, surveys and residents' opinions;
- aggregating activity into local socio-economic indicators;
- ranking problems with broad coverage;
- residents and administration jointly participating in local-budget formation;
- transmitting residents' requests for land and infrastructure.

The available presentation does not establish that these proposed indicators or budgeting methods were validated in practice.

### Land/map discovery

The source proposes:
- viewing land on a map;
- selecting a plot;
- viewing information about future neighbors and their economic activity;
- joining settlement chats;
- online agricultural education;
- support around subsidies and grants;
- cooperation for local tasks and creation of local self-government structures.

### Cooperative marketplace

The source explicitly describes a sales platform:
- individual and joint sale of production;
- sales organizations / own retail points;
- sale to one buyer or a group united into a wholesale purchase;
- suppliers of goods/services for gardeners, farmers and settlements;
- requests for goods and services;
- accounting for effective and non-effective demand;
- support for domestic producers;
- automation, monitoring and logistics of agricultural sales;
- reducing losses in storage and transport.

This means KООПСЕТЬ was broader than group buying: it attempted to connect local demand, supply, production, logistics and community organization.

### Education / coordinators

The 2022 plan includes:
- an educational internet platform;
- pilot groups and courses;
- a stated target of 2,000 coordinators;
- an Academy format;
- pilot implementations in settlements.

The software concept therefore included a human coordinator layer.

### Intended product family

One budget version mentions KООПСЕТЬ plus proposed mobile applications:
- "СОТ Си Пи";
- "Ценовичок";
- "Голосование в кармане";
- "Моё СНТ".

The retrieved material does not establish that all of these were completed as one integrated KООПСЕТЬ product.

## Audience described in the presentation

Segments include:
- family/ancestral homesteads and settlements;
- farms and household farming;
- gardening/housing associations;
- territorial self-government;
- consumer societies/cooperatives;
- NGOs;
- SMEs and self-employed people;
- leaders/chairs of associations and cooperatives;
- municipal/public-sector actors;
- organizations working on ecology, housing, improvement and neighbor relations.

## Economics found in the source versions

The retrieved presentation versions contain different preliminary estimates:
- one version: 5.5m RUB programmer budget, including 3.5m for KООПСЕТЬ and 2m for several mobile apps;
- another version: 15.5m RUB staff/programmer budget, including 7.5m for KООПСЕТЬ and 8m for "СОТ Си Пи".

Both mention promotion spending and an intended move toward self-sufficiency after approximately the first six months.

The retrieved material does not contain a sufficiently detailed and internally consistent revenue model to conclude exactly how KООПСЕТЬ itself was meant to earn money.

## Mapping to FOLKOOP

Already implemented:
- Profile / People;
- Communities and publications;
- messages and linked work chats;
- Together: needs, offers, shared resources and joint purchases;
- Projects with teams/tasks;
- supplier offers and purchase coordination;
- activity journal and unread summaries;
- City civic tools;
- Center as offline/community-space layer;
- action-first Home in v0.23.

Important KООПСЕТЬ ideas still not implemented:
- polls and formal voting;
- community document repository;
- dues/contributions and accounting;
- utility meter readings;
- dispatch/service requests;
- land/resource map;
- local problem aggregation and prioritization;
- participatory-budget workflow;
- broader service/product marketplace;
- coordinator/mentor education.

Payments, legally significant voting, accounting and municipal-budget workflows should not be copied directly into Sweden/Europe. The transferable idea is the architecture, not the Russian legal/institutional form.

## Product principle carried into v0.23 Home

The most useful KООПСЕТЬ principle is:

**one information field -> people + groups + needs + projects + economic cooperation + civic action -> visible next actions**

Therefore FOLKOOP Home is intentionally not an infinite social-media engagement feed. It prioritizes:
1. actions requiring a response;
2. active cooperation;
3. bounded recent activity;
4. community publications;
5. shortcuts to start useful cooperation.
