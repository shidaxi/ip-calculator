# IP Subnet Calculator

A static web tool for calculating IPv4 and IPv6 subnet values. Built with React and Bootstrap.

## Features

- **IPv4 Calculator**: Network class, subnet mask (CIDR), IP address input
- **IPv6 Calculator**: Prefix length, IPv6 address input with `::` shorthand support
- Subnet details: network address, host range, broadcast, total hosts, and more
- Links to RIPE, ASRank, RADAR, and PeeringDB for further lookup

## Tech Stack

- React 18
- React Bootstrap
- Vite

## Getting Started

### Prerequisites

- Node.js 18+

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

Output is in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
ip-calculator/
├── src/
│   ├── App.jsx          # Main app with IPv4/IPv6 tabs
│   ├── App.css          # Custom styles
│   ├── main.jsx         # Entry point
│   └── utils/
│       ├── ipv4.js      # IPv4 calculation logic
│       └── ipv6.js      # IPv6 calculation logic
├── index.html
├── package.json
└── vite.config.js
```

## License

MIT
