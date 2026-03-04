import { useState, useMemo } from 'react';
import {
  Container,
  Tabs,
  Tab,
  Form,
  Row,
  Col,
  Button,
  Table,
  Alert,
} from 'react-bootstrap';
import {
  calculateIPv4,
  generateSubnetOptions,
  isValidIPv4,
  getIpClass,
} from './utils/ipv4';
import {
  calculateIPv6,
  generatePrefixOptions,
  isValidIPv6,
} from './utils/ipv6';

const subnetOptions = generateSubnetOptions();
const prefixOptions = generatePrefixOptions();

function IPv4Calculator() {
  const [networkClass, setNetworkClass] = useState('C');
  const [cidr, setCidr] = useState(32);
  const [ipAddress, setIpAddress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const filteredSubnets = useMemo(() => {
    const classRanges = { A: [1, 32], B: [1, 32], C: [1, 32] };
    const [min, max] = classRanges[networkClass] || [1, 32];
    return subnetOptions.filter((o) => o.value >= min && o.value <= max);
  }, [networkClass]);

  const handleCalculate = () => {
    setError('');
    setResult(null);

    if (!ipAddress.trim()) {
      setError('请输入 IP 地址');
      return;
    }

    if (!isValidIPv4(ipAddress.trim())) {
      setError('请输入有效的 IPv4 地址（例如: 192.168.1.1）');
      return;
    }

    const ip = ipAddress.trim();
    const firstOctet = Number(ip.split('.')[0]);
    const detectedClass = getIpClass(firstOctet);
    setNetworkClass(
      detectedClass === 'A' || detectedClass === 'B' || detectedClass === 'C'
        ? detectedClass
        : 'C'
    );

    const calcResult = calculateIPv4(ip, cidr);
    setResult(calcResult);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCalculate();
    }
  };

  const ripeUrl = result
    ? `https://stat.ripe.net/${result.ipAddress}`
    : '#';
  const asRankUrl = result
    ? `https://asrank.caida.org/asns?search=${result.ipAddress}`
    : '#';
  const radarUrl = result
    ? `https://radar.cloudflare.com/ip/${result.ipAddress}`
    : '#';
  const peeringDbUrl = 'https://www.peeringdb.com/';

  return (
    <>
      <div className="calculator-form bg-light p-4 rounded-3 mb-4">
        <Row className="align-items-end g-3">
          <Col md={3}>
            <Form.Label className="fw-semibold">Network class</Form.Label>
            <div className="d-flex gap-3 mt-1">
              {['A', 'B', 'C'].map((cls) => (
                <Form.Check
                  key={cls}
                  type="radio"
                  id={`class-${cls}`}
                  label={cls}
                  name="networkClass"
                  checked={networkClass === cls}
                  onChange={() => setNetworkClass(cls)}
                />
              ))}
            </div>
          </Col>
          <Col md={4}>
            <Form.Label className="fw-semibold">Subnet</Form.Label>
            <Form.Select
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
            >
              {filteredSubnets.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={5}>
            <Form.Label className="fw-semibold">IP Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. 192.168.1.1"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </Col>
        </Row>
        <div className="text-center mt-4">
          <Button
            variant="primary"
            size="lg"
            className="px-5 rounded-pill"
            onClick={handleCalculate}
          >
            CALCULATE
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {result && (
        <>
          <div className="text-center mb-4">
            <a href={ripeUrl} target="_blank" rel="noreferrer" className="mx-2 link-primary">RIPE</a>
            <a href={asRankUrl} target="_blank" rel="noreferrer" className="mx-2 link-primary">ASRank</a>
            <a href={radarUrl} target="_blank" rel="noreferrer" className="mx-2 link-primary">RADAR</a>
            <a href={peeringDbUrl} target="_blank" rel="noreferrer" className="mx-2 link-primary">PeeringDB</a>
          </div>

          <h5 className="mb-3">Subnet Details</h5>
          <Table bordered hover className="result-table">
            <tbody>
              <tr><th>IP Address:</th><td>{result.ipAddress}</td></tr>
              <tr><th>Network Address:</th><td>{result.networkAddress}</td></tr>
              <tr><th>Usable Host IP Range:</th><td>{result.usableHostRange}</td></tr>
              <tr><th>Broadcast Address:</th><td>{result.broadcastAddress}</td></tr>
              <tr><th>Total Number of Hosts:</th><td>{result.totalHosts.toLocaleString()}</td></tr>
              <tr><th>Number of Usable Hosts:</th><td>{result.usableHosts.toLocaleString()}</td></tr>
              <tr><th>Subnet Mask:</th><td>{result.subnetMask}</td></tr>
              <tr><th>Wildcard Mask:</th><td>{result.wildcardMask}</td></tr>
              <tr><th>Binary Subnet Mask:</th><td>{result.binarySubnetMask}</td></tr>
              <tr><th>IP Class:</th><td>{result.ipClass}</td></tr>
              <tr><th>CIDR Notation:</th><td>{result.cidrNotation}</td></tr>
              <tr><th>IP Type:</th><td>{result.ipType}</td></tr>
            </tbody>
          </Table>

          <Table bordered hover className="result-table mt-4">
            <tbody>
              <tr><th>Short:</th><td>{result.short}</td></tr>
              <tr><th>Binary ID:</th><td className="text-break">{result.binaryId}</td></tr>
              <tr><th>Integer ID:</th><td>{result.integerId}</td></tr>
              <tr><th>Hex ID:</th><td>{result.hexId}</td></tr>
              <tr><th>in-addr.arpa:</th><td>{result.inAddrArpa}</td></tr>
              <tr><th>IPv4 Mapped Address:</th><td>{result.ipv4MappedAddress}</td></tr>
              <tr><th>6to4 Prefix:</th><td>{result.sixToFourPrefix}</td></tr>
            </tbody>
          </Table>
        </>
      )}
    </>
  );
}

function IPv6Calculator() {
  const [prefix, setPrefix] = useState(64);
  const [ipAddress, setIpAddress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    setResult(null);

    if (!ipAddress.trim()) {
      setError('请输入 IPv6 地址');
      return;
    }

    if (!isValidIPv6(ipAddress.trim())) {
      setError('请输入有效的 IPv6 地址（例如: 2001:db8:85a3::8a2e:370:7334）');
      return;
    }

    setResult(calculateIPv6(ipAddress.trim(), prefix));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCalculate();
    }
  };

  const baseIp = ipAddress.trim() || '';
  const ripeUrl = result ? `https://stat.ripe.net/${baseIp}` : '#';
  const asRankUrl = result
    ? `https://asrank.caida.org/asns?search=${baseIp}`
    : '#';
  const radarUrl = result
    ? `https://radar.cloudflare.com/ip/${baseIp}`
    : '#';
  const peeringDbUrl = 'https://www.peeringdb.com/';

  return (
    <>
      <div className="calculator-form bg-light p-4 rounded-3 mb-4">
        <Row className="align-items-end g-3">
          <Col md={5}>
            <Form.Label className="fw-semibold">Prefix Length</Form.Label>
            <Form.Select
              value={prefix}
              onChange={(e) => setPrefix(Number(e.target.value))}
            >
              {prefixOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={7}>
            <Form.Label className="fw-semibold">IP Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. 2001:db8:85a3::8a2e:370:7334"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </Col>
        </Row>
        <div className="text-center mt-4">
          <Button
            variant="primary"
            size="lg"
            className="px-5 rounded-pill"
            onClick={handleCalculate}
          >
            CALCULATE
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {result && (
        <>
          <div className="text-center mb-4">
            <a href={ripeUrl} target="_blank" rel="noreferrer" className="mx-2 link-primary">RIPE</a>
            <a href={asRankUrl} target="_blank" rel="noreferrer" className="mx-2 link-primary">ASRank</a>
            <a href={radarUrl} target="_blank" rel="noreferrer" className="mx-2 link-primary">RADAR</a>
            <a href={peeringDbUrl} target="_blank" rel="noreferrer" className="mx-2 link-primary">PeeringDB</a>
          </div>

          <h5 className="mb-3">Subnet Details</h5>
          <Table bordered hover className="result-table">
            <tbody>
              <tr><th>IP Address:</th><td>{result.ipAddress}</td></tr>
              <tr><th>Full IP Address:</th><td>{result.fullIpAddress}</td></tr>
              <tr><th>Total IP Addresses:</th><td>{result.totalIpAddresses}</td></tr>
              <tr><th>Network:</th><td>{result.network}</td></tr>
              <tr><th>IP Range:</th><td className="text-break">{result.ipRange}</td></tr>
            </tbody>
          </Table>
        </>
      )}
    </>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('ipv4');

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      <h1 className="text-center fw-bold mb-2">IP Subnet Calculator</h1>
      <p className="text-center text-muted mb-4">
        The IP Subnet Calculator tool calculates network values. It uses network
        class, IP address, and subnet mask to calculate and return a list of data
        regarding IPv4 and IPv6 subnets.
      </p>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="ipv4" title="IPV4">
          <IPv4Calculator />
        </Tab>
        <Tab eventKey="ipv6" title="IPV6">
          <IPv6Calculator />
        </Tab>
      </Tabs>
    </Container>
  );
}
