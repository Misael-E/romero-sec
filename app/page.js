'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

const ALERTS = [
	{ time: '03:17:42', sev: 'INFO', msg: 'Routine perimeter scan initiated on all sectors' },
	{ time: '03:17:55', sev: 'WARN', msg: 'Anomalous biological signature detected — sector INTERNAL' },
	{ time: '03:18:08', sev: 'HIGH', msg: 'Unknown entity has bypassed all perimeter defenses — no forced entry' },
	{ time: '03:18:14', sev: 'HIGH', msg: 'Entity established persistent presence in restricted zone: WOMB' },
	{ time: '03:18:21', sev: 'CRIT', msg: 'Persistence mechanism: UNKNOWN — estimated tenure: 9 months' },
	{ time: '03:18:29', sev: 'CRIT', msg: 'Critical file message.enc detected — decryption key is fragmented across evidence' },
	{ time: '03:18:37', sev: 'CRIT', msg: 'Analyst required to reconstruct key before truth can be revealed' },
	{ time: '03:18:45', sev: 'INFO', msg: 'Opening forensic terminal. Good luck, analyst.' },
	{ time: '03:18:50', sev: 'INFO', msg: '─── ANALYST BRIEFING ──────────────────────────────────────' },
	{ time: '03:18:51', sev: 'INFO', msg: 'OBJECTIVE: Reconstruct the decryption key for message.enc' },
	{ time: '03:18:52', sev: 'INFO', msg: 'HOW: Type commands into the secure shell to investigate evidence files' },
	{ time: '03:18:53', sev: 'INFO', msg: 'PROGRESS: Follow the hint bar at the bottom of the terminal for guidance' },
	{ time: '03:18:54', sev: 'INFO', msg: 'MOBILE: Tap the quick-command buttons above the hint bar to run commands' },
	{ time: '03:18:55', sev: 'INFO', msg: 'KEY: 3 fragments are hidden across the evidence — collect all 3 to decode' }
];

const CORRECT_KEY = 'ALPHA_NINE_CONFIRMED';
const WIFE_PASSPHRASE = 'ThorGilly';

// Quick commands shown per stage as tap shortcuts on mobile
const QUICK_CMDS = {
	1: ['whoami', 'ls', 'ps aux'],
	2: ['cat personnel.log', 'strings process_dump.bin', 'hexdump metadata.hex', 'cat network.pcap'],
	3: ['netstat', 'trace secret', 'analyze fragments'],
	4: ['ssh wife@home'],
	5: ['analyze fragments', `decode ${CORRECT_KEY}`]
};

export default function Home() {
	const [phase, setPhase] = useState('breach');
	const [visibleAlerts, setVisibleAlerts] = useState([]);
	const [showBtn, setShowBtn] = useState(false);
	const [lines, setLines] = useState([]);
	const [input, setValue] = useState('');
	const [hint, setHint] = useState('start with <code>whoami</code>');
	const [stage, setStage] = useState(1);
	const [fragments, setFragments] = useState([]);
	const [attempts, setAttempts] = useState(0);
	const [done, setDone] = useState(false);
	const [sshPrompt, setSshPrompt] = useState(false);
	const [hintsLeft, setHintsLeft] = useState(3);
	const [hintVisible, setHintVisible] = useState(false);
	const termRef = useRef(null);
	const inputRef = useRef(null);
	const stateRef = useRef({ stage: 1, fragments: [], attempts: 0 });

	useEffect(() => {
		stateRef.current = { stage, fragments, attempts };
	}, [stage, fragments, attempts]);

	useEffect(() => {
		setHintVisible(false);
	}, [stage]);

	useEffect(() => {
		let i = 0;
		function next() {
			if (i >= ALERTS.length) {
				setShowBtn(true);
				return;
			}
			const idx = i++;
			setVisibleAlerts((prev) => [...prev, idx]);
			setTimeout(next, idx < 2 ? 1000 : 750);
		}
		setTimeout(next, 900);
	}, []);

	useEffect(() => {
		const el = termRef.current;
		if (!el) return;
		requestAnimationFrame(() => {
			el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
		});
	}, [lines]);

	function addLines(newLines) {
		setLines((prev) => [...prev, ...newLines.filter(Boolean)]);
	}

	function startTerminal() {
		setPhase('terminal');
		addLines([
			{ cls: 'warn', txt: 'Connecting to secure shell... OK' },
			{ cls: 'out', txt: 'Incident #IR-2026-0420 mounted. Evidence files available.' },
			{ cls: 'warn', txt: 'WARNING: message.enc is locked. You must reconstruct the decryption key.' },
			{ cls: 'out', txt: 'The key has been split into 3 fragments hidden across the evidence.' },
			{ cls: 'out', txt: 'Type help to see all possible commands.' },
			{ cls: 'out', txt: '' }
		]);
		setTimeout(() => inputRef.current?.focus(), 100);
	}

	function handleKey(e) {
		if (e.key === 'Enter') {
			const cmd = input.trim();
			setValue('');
			if (!cmd) return;
			if (sshPrompt) {
				checkPassphrase(cmd);
			} else {
				processCmd(cmd);
			}
		}
	}

	function tapCmd(cmd) {
		if (sshPrompt) return;
		processCmd(cmd);
		inputRef.current?.focus();
	}

	function revealHint() {
		if (hintsLeft <= 0) return;
		setHintsLeft((n) => n - 1);
		setHintVisible(true);
	}

	function checkPassphrase(passphrase) {
		addLines([{ cls: 'ssh-pass', txt: `Enter passphrase for wife.priv: ${'•'.repeat(passphrase.length)}` }]);
		if (passphrase.toLowerCase() === WIFE_PASSPHRASE.toLowerCase()) {
			addLines([
				{ cls: 'out',  txt: '' },
				{ cls: 'warn', txt: "wife@home:~$  Hey. I've been waiting for you to find this." },
				{ cls: 'warn', txt: "wife@home:~$  I've been keeping something from you." },
				{ cls: 'warn', txt: "wife@home:~$  message.enc has everything. Here's my signing key:" },
				{ cls: 'out',  txt: '' },
				{ cls: 'key',  txt: '  -----BEGIN LOVE KEY-----' },
				{ cls: 'key',  txt: '  Issuer:        wife@home' },
				{ cls: 'key',  txt: '  Authorization: GRANTED' },
				{ cls: 'key',  txt: '  Signature:     wife.priv' },
				{ cls: 'key',  txt: '  -----END LOVE KEY-----' },
				{ cls: 'out',  txt: '' },
				{ cls: 'warn', txt: "wife@home:~$  Run decode when you're ready." },
				{ cls: 'out',  txt: '' },
				{ cls: 'out',  txt: 'Connection closed by remote host.' },
				{ cls: 'out',  txt: '' },
			]);
			setSshPrompt(false);
			setStage(5);
			stateRef.current.stage = 5;
			setHint(`secondary key received — try: <code>decode ${CORRECT_KEY}</code>`);
		} else {
			addLines([
				{ cls: 'err', txt: 'Permission denied (publickey).' },
				{ cls: 'out', txt: '' },
				{ cls: 'out', txt: 'Enter passphrase for wife.priv: ' },
			]);
		}
	}

	function printCmd(cmd) {
		return { cls: 'prompt-line', txt: `analyst@soc:~$ ${cmd}` };
	}

	function processCmd(raw) {
		const cmd = raw.toLowerCase().trim();
		const { stage: s, fragments: frags, attempts: att } = stateRef.current;
		const out = [printCmd(raw)];

		if (cmd === 'clear') {
			setLines([]);
			return;
		}

		if (cmd === 'help') {
			out.push(
				{ cls: 'out', txt: 'Available commands (more unlock as you progress):' },
				{ cls: 'out', txt: '  General:  clear, help' },
				s >= 1 ? { cls: 'out', txt: '  Stage 1:  whoami, ls, ps aux' } : null,
				s >= 2 ? { cls: 'out', txt: '  Stage 2:  cat <file>, strings process_dump.bin, hexdump metadata.hex' } : null,
				s >= 3 ? { cls: 'out', txt: '  Stage 3:  netstat, trace secret, analyze fragments' } : null,
				s >= 4 ? { cls: 'out', txt: '  Stage 4:  decode <key>' } : null,
				{ cls: 'out', txt: '' }
			);
			addLines(out);
			return;
		}

		// ── Stage 1 ──
		if (s === 1) {
			if (cmd === 'whoami') {
				out.push(
					{ cls: 'out', txt: 'analyst — Tier 3 Investigator, NEXUS-SOC' },
					{ cls: 'out', txt: 'Clearance: SECRET | Active incident: IR-2026-0420' },
					{ cls: 'warn', txt: 'NOTE: Your personal life may be relevant to this investigation.' },
					{ cls: 'key', txt: '[KEY FRAGMENT A recovered from clearance record: "ALPHA"]' },
					{ cls: 'out', txt: '' }
				);
				setFragments((prev) => (prev.includes('ALPHA') ? prev : [...prev, 'ALPHA']));
				stateRef.current.fragments = frags.includes('ALPHA') ? frags : [...frags, 'ALPHA'];
				setHint('now try <code>ls</code> to see available files');
			} else if (cmd === 'ls') {
				if (!frags.includes('ALPHA')) {
					out.push({ cls: 'err', txt: 'Access denied. Verify your identity first with `whoami`.' }, { cls: 'out', txt: '' });
				} else {
					out.push(
						{ cls: 'out', txt: 'quarantine/' },
						{ cls: 'out', txt: '├── personnel.log       [READ]' },
						{ cls: 'out', txt: '├── process_dump.bin    [READ]' },
						{ cls: 'out', txt: '├── network.pcap        [READ]' },
						{ cls: 'out', txt: '├── metadata.hex        [READ]' },
						{ cls: 'out', txt: '└── message.enc         [LOCKED — needs key]' },
						{ cls: 'out', txt: '' }
					);
					setHint('try <code>ps aux</code> — check what processes are running');
				}
			} else if (cmd === 'ps aux') {
				if (!frags.includes('ALPHA')) {
					out.push({ cls: 'err', txt: 'Run `whoami` first.' }, { cls: 'out', txt: '' });
				} else {
					out.push(
						{ cls: 'out', txt: 'PID    PROCESS                     CPU    MEM' },
						{ cls: 'out', txt: '001    kernel_watchdog              0.1%   12MB' },
						{ cls: 'out', txt: '002    morning_sickness.exe         98.2%  512MB' },
						{ cls: 'out', txt: '003    craving_daemon               44.1%  —' },
						{ cls: 'out', txt: '420    ???.process                  —      —      [UNKNOWN]' },
						{ cls: 'out', txt: '999    happiness_amplifier          —      —' },
						{ cls: 'warn', txt: 'Suspicious process PID 420 cannot be identified. Investigate further.' },
						{ cls: 'out', txt: '' }
					);
					setStage(2);
					stateRef.current.stage = 2;
					setHint('suspicious process found — try <code>strings process_dump.bin</code>');
				}
			} else {
				out.push({ cls: 'err', txt: `unknown command: ${raw}  (try: whoami, ls, ps aux)` }, { cls: 'out', txt: '' });
			}
			addLines(out);
			return;
		}

		// ── Stage 2 ──
		if (s === 2) {
			if (cmd === 'cat personnel.log') {
				out.push(
					{ cls: 'out', txt: '[LOG] Analyst profile loaded.' },
					{ cls: 'out', txt: '[LOG] Home address: REDACTED' },
					{ cls: 'out', txt: '[LOG] Emergency contact: [REDACTED] — relationship: wife' },
					{ cls: 'warn', txt: '[LOG] Recent anomaly flagged at home sector. Analyst may be a person of interest.' },
					{ cls: 'out', txt: '' }
				);
				setHint('try <code>strings process_dump.bin</code>');
			} else if (cmd === 'strings process_dump.bin') {
				out.push(
					{ cls: 'out', txt: 'Extracting printable strings from binary...' },
					{ cls: 'out', txt: '...' },
					{ cls: 'out', txt: '"init sequence started"' },
					{ cls: 'out', txt: '"heartbeat confirmed at 147bpm"' },
					{ cls: 'out', txt: '"growth rate: nominal"' },
					{ cls: 'out', txt: '"sector WOMB: fully occupied"' },
					{ cls: 'key', txt: '"KEY FRAGMENT B: NINE"' },
					{ cls: 'out', txt: '"[end of strings]"' },
					{ cls: 'out', txt: '' }
				);
				const newFrags = frags.includes('NINE') ? frags : [...frags, 'NINE'];
				setFragments(newFrags);
				stateRef.current.fragments = newFrags;
				setHint('fragment found! now try <code>hexdump metadata.hex</code>');
			} else if (cmd === 'hexdump metadata.hex') {
				const currentFrags = stateRef.current.fragments;
				if (!currentFrags.includes('NINE')) {
					out.push({ cls: 'err', txt: 'File locked. Analyze process_dump.bin first.' }, { cls: 'out', txt: '' });
				} else {
					out.push(
						{ cls: 'out', txt: 'Offset   00 01 02 03 04 05 06 07   Decoded' },
						{ cls: 'out', txt: '0x0000   48 65 61 72 74 62 65 61   Heartbea' },
						{ cls: 'out', txt: '0x0008   74 3a 20 70 72 65 73 65   t: prese' },
						{ cls: 'out', txt: '0x0010   6e 74 2e 20 53 69 7a 65   nt. Size' },
						{ cls: 'out', txt: '0x0018   3a 20 74 69 6e 79 2e 20   : gilly. ' },
						{ cls: 'out', txt: '0x0020   45 54 41 3a 20 39 6d 6f   ETA: 9mo' },
						{ cls: 'warn', txt: 'Hidden comment found at offset 0xFF:' },
						{ cls: 'key', txt: '  # fragment_C = "CONFIRMED"' },
						{ cls: 'out', txt: '' }
					);
					const newFrags2 = currentFrags.includes('CONFIRMED') ? currentFrags : [...currentFrags, 'CONFIRMED'];
					setFragments(newFrags2);
					stateRef.current.fragments = newFrags2;
					setStage(3);
					stateRef.current.stage = 3;
					setHint('all fragments found! move to stage 3 — try <code>netstat</code>');
				}
			} else if (cmd === 'cat network.pcap') {
				out.push(
					{ cls: 'out', txt: 'Packet capture (truncated):' },
					{ cls: 'out', txt: 'SRC: internal:unknown  DST: analyst:home  PROTO: LOVE' },
					{ cls: 'out', txt: 'SRC: womb:occupied     DST: world:waiting PROTO: LIFE' },
					{ cls: 'warn', txt: 'Payload: encrypted. Full decode requires reconstructed key.' },
					{ cls: 'out', txt: '' }
				);
			} else {
				out.push(
					{ cls: 'err', txt: `unknown command or file locked: ${raw}` },
					{ cls: 'out', txt: 'hint: strings process_dump.bin | hexdump metadata.hex | cat <file>' },
					{ cls: 'out', txt: '' }
				);
			}
			addLines(out);
			return;
		}

		// ── Stage 3 ──
		if (s === 3) {
			if (cmd === 'netstat') {
				out.push(
					{ cls: 'out', txt: 'Active connections:' },
					{ cls: 'out', txt: 'PROTO  SRC                DEST              STATE' },
					{ cls: 'out', txt: 'TCP    heart:beat         entity:unknown    ESTABLISHED' },
					{ cls: 'out', txt: 'TCP    womb:occupied      entity:growing    LISTEN' },
					{ cls: 'out', txt: 'TCP    analyst:home       truth:pending     SYN_SENT' },
					{ cls: 'out', txt: 'UDP    secret:kept        analyst:inbox     DELIVERING' },
					{ cls: 'out', txt: '' },
					{ cls: 'warn', txt: 'Connection "secret:kept -> analyst:inbox" is active. Trace it.' },
					{ cls: 'out', txt: '' }
				);
				setHint('trace the secret connection: <code>trace secret</code>');
			} else if (cmd === 'trace secret' || cmd === 'trace') {
				out.push(
					{ cls: 'out', txt: 'Tracing route to secret:kept...' },
					{ cls: 'out', txt: '1  home.network (192.168.0.1)      1ms' },
					{ cls: 'out', txt: '2  wife.local   (10.0.0.2)         2ms' },
					{ cls: 'out', txt: '3  heart.love   (REDACTED)          —' },
					{ cls: 'out', txt: '4  secret.kept  (DESTINATION)       —' },
					{ cls: 'out', txt: '' },
					{ cls: 'warn', txt: 'Trace reached origin. Packet contents:' },
					{ cls: 'out', txt: '  "She has been carrying this secret for weeks."' },
					{ cls: 'out', txt: '  "The message.enc file holds the full truth."' },
					{ cls: 'out', txt: '  "Reconstruct your key from the 3 fragments you found."' },
					{ cls: 'out', txt: '' }
				);
				setHint('you have all 3 fragments — try <code>analyze fragments</code>');
			} else if (cmd === 'analyze fragments' || cmd === 'analyze') {
				const f = stateRef.current.fragments;
				if (f.length < 3) {
					out.push({ cls: 'err', txt: `Only ${f.length}/3 fragments collected. Keep investigating.` }, { cls: 'out', txt: '' });
				} else {
					out.push(
						{ cls: 'out', txt: 'Fragment analysis:' },
						{ cls: 'key', txt: `  [A] ${f[0]}` },
						{ cls: 'key', txt: `  [B] ${f[1]}` },
						{ cls: 'key', txt: `  [C] ${f[2]}` },
						{ cls: 'out', txt: '' },
						{ cls: 'out', txt: 'Concatenation order: A + _ + B + _ + C' },
						{ cls: 'warn', txt: `Assembled key: ${f[0]}_${f[1]}_${f[2]}` },
						{ cls: 'out', txt: '' },
						{ cls: 'warn', txt: 'WARNING: message.enc uses dual-key encryption.' },
						{ cls: 'out', txt: 'Your assembled key is the primary key.' },
						{ cls: 'out', txt: 'A secondary private key is required from the co-signer on record.' },
						{ cls: 'out', txt: 'Co-signer: wife@home' },
						{ cls: 'out', txt: '' },
						{ cls: 'out', txt: 'Request her private key before decryption can proceed.' },
						{ cls: 'out', txt: 'Syntax: ssh wife@home' },
						{ cls: 'out', txt: '' }
					);
					setStage(4);
					stateRef.current.stage = 4;
					setHint('request secondary key — try <code>ssh wife@home</code>');
				}
			} else {
				out.push(
					{ cls: 'err', txt: `unknown command: ${raw}` },
					{ cls: 'out', txt: 'hint: netstat | trace secret | analyze fragments' },
					{ cls: 'out', txt: '' }
				);
			}
			addLines(out);
			return;
		}

		// ── Stage 4 — AUTH ──
		if (s === 4) {
			if (cmd === 'ssh wife@home' || cmd === 'ssh wife') {
				out.push(
					{ cls: 'out', txt: 'Initiating SSH connection to wife@home...' },
					{ cls: 'out', txt: 'Authenticating... ████████████ handshake complete' },
					{ cls: 'out', txt: '' },
					{ cls: 'out', txt: 'Enter passphrase for wife.priv: ' },
				);
				addLines(out);
				setSshPrompt(true);
				setHint('type the passphrase and press Enter');
				setTimeout(() => inputRef.current?.focus(), 50);
				return;
			}
			out.push(
				{ cls: 'err', txt: `unknown command: ${raw}` },
				{ cls: 'out', txt: 'hint: ssh wife@home' },
				{ cls: 'out', txt: '' }
			);
			addLines(out);
			return;
		}

		// ── Stage 5 — DECODE ──
		if (s === 5) {
			if (cmd === 'analyze fragments') {
				const f = stateRef.current.fragments;
				out.push(
					{ cls: 'out', txt: 'Fragment analysis:' },
					{ cls: 'key', txt: `  [A] ${f[0]}` },
					{ cls: 'key', txt: `  [B] ${f[1]}` },
					{ cls: 'key', txt: `  [C] ${f[2]}` },
					{ cls: 'warn', txt: `Full key: ${f[0]}_${f[1]}_${f[2]}` },
					{ cls: 'out', txt: '' }
				);
				addLines(out);
				return;
			}
			if (cmd.startsWith('decode ')) {
				const key = raw.slice(7).trim();
				const newAtt = att + 1;
				setAttempts(newAtt);
				stateRef.current.attempts = newAtt;
				if (key.toUpperCase() === CORRECT_KEY) {
					out.push(
						{ cls: 'out', txt: 'Verifying key... ██████████ 100%' },
						{ cls: 'out', txt: 'Decrypting message.enc...' },
						{ cls: 'out', txt: '' },
						{ cls: 'hi', txt: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
						{ cls: 'hi', txt: '' },
						{ cls: 'hi', txt: '  Hi love.' },
						{ cls: 'hi', txt: '' },
						{ cls: 'hi', txt: "  You've just investigated the greatest breach" },
						{ cls: 'hi', txt: "  of your life — and you didn't even know it." },
						{ cls: 'hi', txt: '' },
						{ cls: 'hi', txt: "  We're having a baby." },
						{ cls: 'hi', txt: '' },
						{ cls: 'hi', txt: '  ETA: approximately 9 months.' },
						{ cls: 'hi', txt: '  Threat level: maximum cuteness.' },
						{ cls: 'hi', txt: '  Recommended action: go hug your wife.' },
						{ cls: 'hi', txt: '' },
						{ cls: 'hi', txt: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
						{ cls: 'out', txt: '' },
						{ cls: 'key', txt: 'INCIDENT #IR-2024-0309 — STATUS: CLOSED (BEST POSSIBLE OUTCOME)' },
						{ cls: 'out', txt: '' }
					);
					setDone(true);
					setStage(6);
					setHint('investigation complete. congratulations, dad.');
				} else {
					out.push({ cls: 'err', txt: `Decryption failed. Key "${key}" is incorrect.` }, { cls: 'out', txt: '' });
					if (newAtt === 1) out.push({ cls: 'warn', txt: 'Hint: the key is 3 fragments joined by underscores.' }, { cls: 'out', txt: '' });
					if (newAtt === 2) out.push({ cls: 'warn', txt: 'Hint: run `analyze fragments` to see the full key.' }, { cls: 'out', txt: '' });
					if (newAtt >= 3) out.push({ cls: 'warn', txt: 'Hint: try exactly — decode ALPHA_NINE_CONFIRMED' }, { cls: 'out', txt: '' });
				}
				addLines(out);
				return;
			}
			out.push({ cls: 'err', txt: 'syntax: decode <key>' }, { cls: 'out', txt: '' });
			addLines(out);
			return;
		}

		out.push({ cls: 'err', txt: `command not found: ${raw}` }, { cls: 'out', txt: '' });
		addLines(out);
	}

	const sevColor = (sev) => (sev === 'CRIT' ? '#ff4444' : sev === 'HIGH' ? '#e0b452' : sev === 'WARN' ? '#e0b452' : '#52e086');

	const stepClass = (n) => {
		if (n < stage) return styles.stepDone;
		if (n === stage) return styles.stepActive;
		return styles.stepLocked;
	};

	const currentQuickCmds = QUICK_CMDS[Math.min(stage, 5)] || [];

	return (
		<main className={styles.app}>
			{/* Top bar */}
			<div className={styles.topbar}>
				<span className={`${styles.dot} ${styles.dotR}`} />
				<span className={`${styles.dot} ${styles.dotY}`} />
				<span className={`${styles.dot} ${styles.dotG}`} />
				<span className={styles.topbarTitle}>NEXUS-SOC — SECURITY OPERATIONS CENTER v4.2</span>
			</div>

			{/* Status bar */}
			<div className={styles.statusBar}>
				<span>
					NODE: <span className={styles.val}>soc-primary-01</span>
				</span>
				<span>
					USER: <span className={styles.val}>analyst</span>
				</span>
				<span>
					THREAT: <span style={{ color: '#ff4444' }}>CRITICAL</span>
				</span>
				<span>
					INC: <span className={styles.val}>{visibleAlerts.length}</span>
				</span>
			</div>

			{/* ── Breach Phase ── */}
			{phase === 'breach' && (
				<div className={styles.breach}>
					<div className={styles.alertHeader}>
						<span className={`${styles.dot} ${styles.dotR} ${styles.blink}`} />
						<span className={styles.alertTitle}>ACTIVE INCIDENT — UNAUTHORIZED ENTITY DETECTED</span>
					</div>
					<div className={styles.alertsList}>
						{visibleAlerts.map((i) => (
							<div key={i} className={`${styles.alertRow} ${styles.visible}`}>
								<span className={styles.alertTime}>{ALERTS[i].time}</span>
								<span className={styles.alertSev} style={{ color: sevColor(ALERTS[i].sev), borderColor: sevColor(ALERTS[i].sev) }}>
									[{ALERTS[i].sev}]
								</span>
								<span className={styles.alertMsg}>{ALERTS[i].msg}</span>
							</div>
						))}
					</div>
					{showBtn && (
						<button className={styles.investigateBtn} onClick={startTerminal}>
							[ OPEN INVESTIGATION TERMINAL ]
						</button>
					)}
				</div>
			)}

			{/* ── Terminal Phase ── */}
			{phase === 'terminal' && (
				<div className={styles.terminal}>
					<div className={styles.termHeader}>NEXUS-SOC FORENSIC SHELL v3.1 — INCIDENT #IR-2024-0309</div>

					{/* Progress steps */}
					<div className={styles.progressBar}>
						INVESTIGATION:&nbsp;
						{['RECON', 'ENUM', 'ANALYSIS', 'AUTH', 'DECODE'].map((label, i) => (
							<span key={label} className={`${styles.step} ${stepClass(i + 1)}`}>
								{i + 1}. {label}
							</span>
						))}
					</div>

					{/* Output */}
					<div className={styles.termBody} ref={termRef}>
						{lines.map((l, i) => (
							<div key={i} className={`${styles.tLine} ${styles[l.cls] || ''}`}>
								{l.cls === 'prompt-line' ? (
									<>
										<span className={styles.tPrompt}>analyst@soc:~$</span>{' '}
										<span className={styles.tCmd}>{l.txt.replace('analyst@soc:~$ ', '')}</span>
									</>
								) : (
									l.txt
								)}
							</div>
						))}
					</div>

					{/* Input row */}
					<div className={styles.inputRow}>
						<span className={styles.promptLabel}>
							{sshPrompt ? 'passphrase:' : 'analyst@soc:~$'}
						</span>
						<input
							ref={inputRef}
							className={styles.cmdInput}
							type={sshPrompt ? 'password' : 'text'}
							autoComplete='off'
							autoCorrect='off'
							autoCapitalize='none'
							spellCheck={false}
							placeholder={done ? '' : sshPrompt ? '' : 'type a command...'}
							value={input}
							disabled={done}
							onChange={(e) => setValue(e.target.value)}
							onKeyDown={handleKey}
						/>
					</div>

					{/* Quick-command tap buttons (great for mobile) */}
					{!done && (
						<div className={styles.quickCmds}>
							{currentQuickCmds.map((c) => (
								<button key={c} className={styles.quickBtn} onClick={() => tapCmd(c)}>
									{c}
								</button>
							))}
						</div>
					)}

					{/* Hint bar */}
					<div className={styles.hintBar}>
						{done ? (
							<span dangerouslySetInnerHTML={{ __html: hint }} />
						) : hintVisible ? (
							<span dangerouslySetInnerHTML={{ __html: 'hint: ' + hint }} />
						) : hintsLeft > 0 ? (
							<button className={styles.hintBtn} onClick={revealHint}>
								[ REQUEST HINT — {hintsLeft} remaining ]
							</button>
						) : (
							<span className={styles.hintExhausted}>
								NO HINTS REMAINING —{' '}
								<button className={styles.restartBtn} onClick={() => window.location.reload()}>
									[ RESTART INVESTIGATION ]
								</button>
							</span>
						)}
					</div>
				</div>
			)}
		</main>
	);
}
