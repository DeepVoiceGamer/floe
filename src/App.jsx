import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PACKAGES = [
  { attr: "pkgs.neovim", name: "neovim", version: "0.9.5", description: "Vim-fork focused on extensibility and usability", installed: false },
{ attr: "pkgs.ripgrep", name: "ripgrep", version: "14.1.0", description: "A search tool combining usability with raw speed", installed: true },
{ attr: "pkgs.fd", name: "fd", version: "9.0.0", description: "A simple, fast alternative to find", installed: false },
{ attr: "pkgs.bat", name: "bat", version: "0.24.0", description: "A cat clone with syntax highlighting and Git integration", installed: true },
{ attr: "pkgs.htop", name: "htop", version: "3.3.0", description: "An interactive process viewer for Unix systems", installed: false },
{ attr: "pkgs.fzf", name: "fzf", version: "0.46.1", description: "A command-line fuzzy finder", installed: false },
{ attr: "pkgs.zoxide", name: "zoxide", version: "0.9.4", description: "A smarter cd command", installed: false },
{ attr: "pkgs.starship", name: "starship", version: "1.17.1", description: "A minimal, blazing fast shell prompt", installed: true },
{ attr: "pkgs.tmux", name: "tmux", version: "3.4", description: "Terminal multiplexer", installed: false },
{ attr: "pkgs.git", name: "git", version: "2.43.0", description: "Distributed version control system", installed: true },
{ attr: "pkgs.curl", name: "curl", version: "8.6.0", description: "Command line tool for transferring data", installed: false },
{ attr: "pkgs.jq", name: "jq", version: "1.7.1", description: "Flexible command-line JSON processor", installed: false },
{ attr: "pkgs.firefox", name: "firefox", version: "123.0", description: "Free and open source web browser", installed: false },
{ attr: "pkgs.alacritty", name: "alacritty", version: "0.13.1", description: "GPU-accelerated terminal emulator", installed: false },
{ attr: "pkgs.direnv", name: "direnv", version: "2.34.0", description: "Shell extension for environment variables", installed: false },
{ attr: "pkgs.exa", name: "exa", version: "0.10.1", description: "A modern replacement for ls", installed: false },
{ attr: "pkgs.lazygit", name: "lazygit", version: "0.40.2", description: "Simple terminal UI for git commands", installed: false },
{ attr: "pkgs.btop", name: "btop", version: "1.3.0", description: "Resource monitor with a fancy interface", installed: false },
];

const BASE_INSTALLED = new Set(["pkgs.ripgrep","pkgs.bat","pkgs.starship","pkgs.git"]);

const SHELLS = [
  { id: "bash", name: "bash", active: true, default: true, file: "shells/bash.nix", description: "GNU Bourne Again shell" },
{ id: "zsh", name: "zsh", active: true, default: false, file: "shells/zsh.nix", description: "Z shell with extended features" },
{ id: "fish", name: "fish", active: false, default: false, file: "shells/fish.nix", description: "Friendly interactive shell" },
{ id: "nushell", name: "nushell", active: false, default: false, file: "shells/nushell.nix", description: "A new type of shell" },
];

const SHELL_CONFIGS = {
  bash: `# shells/bash.nix
  { config, pkgs, ... }:
  {
    programs.bash = {
      enable = true;
      enableCompletion = true;
      shellAliases = {
        ll = "ls -la";
        gs = "git status";
        rebuild = "sudo nixos-rebuild switch --flake .#";
      };
      initExtra = ''
      export EDITOR=vim
      export PATH=$HOME/.local/bin:$PATH
      '';
    };
  }`,
  zsh: `# shells/zsh.nix
  { config, pkgs, ... }:
  {
    programs.zsh = {
      enable = true;
      enableAutosuggestions = true;
      enableSyntaxHighlighting = true;
      oh-my-zsh = {
        enable = true;
        plugins = [ "git" "docker" "kubectl" ];
        theme = "robbyrussell";
      };
      shellAliases = {
        ll = "ls -la";
        gs = "git status";
      };
    };
  }`,
  fish: `# shells/fish.nix
  { config, pkgs, ... }:
  {
    programs.fish = {
      enable = true;
      shellAliases = {
        ll = "ls -la";
        gs = "git status";
      };
      plugins = [
        { name = "tide"; src = pkgs.fishPlugins.tide.src; }
      ];
    };
  }`,
  nushell: `# shells/nushell.nix
  { config, pkgs, ... }:
  {
    programs.nushell = {
      enable = true;
      configFile.text = ''
      $env.config = {
        show_banner: false
        edit_mode: vi
      }
      '';
    };
  }`,
};

const NIX_OPTIONS = [
  { category: "Networking", key: "networking.hostName", type: "string", default: '"nixos"', description: "The hostname of your machine.", value: '"my-nixos"', example: '"my-machine"' },
{ category: "Networking", key: "networking.firewall.enable", type: "boolean", default: "true", description: "Whether to enable the firewall.", value: "true", example: "true" },
{ category: "Networking", key: "networking.firewall.allowedTCPPorts", type: "list of port", default: "[]", description: "List of TCP ports to allow through the firewall.", value: "[ 22 80 443 ]", example: "[ 22 80 443 ]" },
{ category: "Networking", key: "networking.networkmanager.enable", type: "boolean", default: "false", description: "Whether to enable NetworkManager.", value: "true", example: "true" },
{ category: "Boot", key: "boot.loader.systemd-boot.enable", type: "boolean", default: "false", description: "Whether to enable the systemd-boot EFI boot manager.", value: "true", example: "true" },
{ category: "Boot", key: "boot.loader.efi.canTouchEfiVariables", type: "boolean", default: "false", description: "Whether the installation process is allowed to modify EFI boot variables.", value: "true", example: "true" },
{ category: "Boot", key: "boot.kernelPackages", type: "package set", default: "pkgs.linuxPackages", description: "The kernel package set to use.", value: "pkgs.linuxPackages_latest", example: "pkgs.linuxPackages_latest" },
{ category: "Services", key: "services.openssh.enable", type: "boolean", default: "false", description: "Whether to enable the OpenSSH secure shell daemon.", value: "false", example: "true" },
{ category: "Services", key: "services.xserver.enable", type: "boolean", default: "false", description: "Whether to enable the X Window System.", value: "true", example: "true" },
{ category: "Services", key: "services.printing.enable", type: "boolean", default: "false", description: "Whether to enable printing support through CUPS.", value: "false", example: "true" },
{ category: "Hardware", key: "hardware.bluetooth.enable", type: "boolean", default: "false", description: "Whether to enable Bluetooth support.", value: "true", example: "true" },
{ category: "Hardware", key: "hardware.opengl.enable", type: "boolean", default: "false", description: "Whether to enable OpenGL drivers.", value: "true", example: "true" },
{ category: "Users", key: "users.users.<name>.isNormalUser", type: "boolean", default: "false", description: "Indicates whether this is an account for a real user.", value: "true", example: "true" },
{ category: "System", key: "system.stateVersion", type: "string", default: '"23.11"', description: "NixOS state version — do not change after initial install.", value: '"24.05"', example: '"24.05"' },
{ category: "System", key: "nix.settings.experimental-features", type: "list", default: "[]", description: "Enable experimental Nix features.", value: '[ "nix-command" "flakes" ]', example: '[ "nix-command" "flakes" ]' },
];

const FLAKE_INPUTS = [
  { name: "nixpkgs", url: "github:nixos/nixpkgs/nixos-unstable", locked: "2024-02-15", rev: "abc123f", outdated: false },
{ name: "home-manager", url: "github:nix-community/home-manager", locked: "2024-02-10", rev: "def456a", outdated: true },
{ name: "nixos-hardware", url: "github:NixOS/nixos-hardware", locked: "2024-01-28", rev: "ghi789b", outdated: false },
{ name: "flake-utils", url: "github:numtide/flake-utils", locked: "2024-02-01", rev: "jkl012c", outdated: true },
];

const GENERATIONS = [
  { id: 47, date: "2024-02-15 14:32", current: true, pkgCount: 42, kernel: "6.7.4", desc: "Added neovim, updated inputs" },
{ id: 46, date: "2024-02-12 09:14", current: false, pkgCount: 41, kernel: "6.7.4", desc: "Enabled bluetooth" },
{ id: 45, date: "2024-02-08 16:55", current: false, pkgCount: 40, kernel: "6.7.2", desc: "Updated nixpkgs input" },
{ id: 44, date: "2024-02-01 11:20", current: false, pkgCount: 39, kernel: "6.7.2", desc: "Added starship, ripgrep" },
{ id: 43, date: "2024-01-25 08:45", current: false, pkgCount: 37, kernel: "6.6.8", desc: "Initial workstation setup" },
{ id: 42, date: "2024-01-18 19:30", current: false, pkgCount: 32, kernel: "6.6.8", desc: "Base system configuration" },
];

const GEN_CONFIGS = (id) => `# Generation ${id} — configuration snapshot
{ config, pkgs, ... }:
{
  imports = [ ./hardware-configuration.nix ];

  networking.hostName = "nixos";
  networking.firewall.enable = true;

  environment.systemPackages = with pkgs; [
    pkgs.git
    pkgs.ripgrep
    pkgs.bat
    pkgs.starship
    ${id >= 46 ? "pkgs.neovim\n    pkgs.htop" : "pkgs.htop"}
  ];

  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;
  boot.kernelPackages = pkgs.linuxPackages${id >= 45 ? "_latest" : ""};

  system.stateVersion = "24.05";
}`;

// ─── ICONS ───────────────────────────────────────────────────────────────────

const Icon = ({ d: path, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
  <path d={path} />
  </svg>
);

const Icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  packages: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  shells: "M4 17l6-6-6-6 M12 19h8",
  options: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  flakes: "M12 2v20 M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  generations: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  search: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  x: "M18 6 6 18M6 6l12 12",
  check: "M20 6 9 17l-5-5",
  terminal: "M4 17l6-6-6-6M12 19h8",
  sun: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  flake: "M12 2v20M7 7l5-5 5 5M7 17l5 5 5-5",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  cpu: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
  memory: "M2 9h20M2 15h20M5 3v18M19 3v18M9 3v18M15 3v18",
  disk: "M22 12H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  rollback: "M1 4v6h6M3.51 15a9 9 0 1 0 .49-3",
  snowflake: "M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93",
  chevronRight: "M9 18l6-6-6-6",
};

// ─── SYNTAX HIGHLIGHT ─────────────────────────────────────────────────────────

function NixCode({ code, addedLines = new Set(), removedLines = new Set(), theme }) {
  const tm = theme === "terminal";
  const dk = theme === "dark" || tm;
  const C = {
    comment: tm ? "#2a5c2a" : dk ? "#4a5a6a" : "#8899aa",
    keyword: tm ? "#66ff66" : dk ? "#c792ea" : "#7c3aed",
    string: tm ? "#88ff88" : dk ? "#c3e88d" : "#16a34a",
    attr: tm ? "#aaffaa" : dk ? "#82aaff" : "#2563eb",
    value: tm ? "#66ff66" : dk ? "#f78c6c" : "#c2410c",
    punct: tm ? "#55ff55" : dk ? "#89ddff" : "#0891b2",
    normal: tm ? "#33ff33" : dk ? "#cdd6f4" : "#1e293b",
    lineNum: tm ? "#1a3a1a" : dk ? "#2a3a4a" : "#d1d5db",
    addedBg: tm ? "rgba(51,255,51,0.07)" : dk ? "rgba(52,199,123,0.12)" : "rgba(52,199,123,0.09)",
    removedBg: tm ? "rgba(255,68,68,0.07)" : dk ? "rgba(240,96,96,0.12)" : "rgba(240,96,96,0.09)",
    addedFg: tm ? "#33ff33" : "#34c77b",
    removedFg: tm ? "#ff4444" : "#f06060",
  };

  return (
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11.5px", lineHeight: "1.7" }}>
    {code.split("\n").map((line, i) => {
      const tr = line.trim();
      const isAdded = addedLines.has(tr.replace(/[,\s]/g, ""));
      const isRemoved = removedLines.has(tr.replace(/[,\s]/g, ""));
      let color = C.normal;
      if (tr.startsWith("#")) color = C.comment;
      else if (tr.startsWith("pkgs.")) color = isAdded ? C.addedFg : isRemoved ? C.removedFg : C.value;
      else if (tr.includes('"github:') || (tr.startsWith('"') && !tr.includes(" = "))) color = C.string;
      else if (tr.endsWith("{") || tr === "}" || tr === "};") color = C.punct;
      else if (["with","let","in","rec","if","then","else","inherit"].some(k => tr.startsWith(k+" "))) color = C.keyword;

      const hasEq = tr.includes(" = ") && !tr.startsWith("#");

      return (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start",
          background: isAdded ? C.addedBg : isRemoved ? C.removedBg : "transparent",
          borderLeft: isAdded ? `2px solid ${C.addedFg}` : isRemoved ? `2px solid ${C.removedFg}` : "2px solid transparent",
          paddingLeft: "10px", paddingRight: "14px",
        }}>
        <span style={{ color: C.lineNum, marginRight: "14px", fontSize: "10px", userSelect: "none", minWidth: "22px", textAlign: "right", paddingTop: "1px" }}>{i + 1}</span>
        {hasEq ? (() => {
          const eq = line.indexOf(" = ");
          return <span><span style={{ color: C.attr }}>{line.slice(0, eq)}</span><span style={{ color: C.punct }}>{" = "}</span><span style={{ color: C.string }}>{line.slice(eq + 3)}</span></span>;
        })() : <span style={{ color }}>{line}</span>}
        {isAdded && <span style={{ marginLeft: "8px", fontSize: "10px", color: C.addedFg, opacity: 0.65, flexShrink: 0 }}>+</span>}
        {isRemoved && <span style={{ marginLeft: "8px", fontSize: "10px", color: C.removedFg, opacity: 0.65, flexShrink: 0 }}>−</span>}
        </div>
      );
    })}
    </div>
  );
}

// ─── RIGHT PANEL WRAPPER ─────────────────────────────────────────────────────

function RightPanel({ title, subtitle, children, T, dot }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.codeBg }}>
    <div style={{
      padding: "0 14px", height: "40px", flexShrink: 0,
      borderBottom: `1px solid rgba(255,255,255,0.06)`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
    <div style={{ display: "flex", gap: "5px" }}>
    {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: "9px", height: "9px", borderRadius: "50%", background: c }} />)}
    </div>
    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}>{title}</span>
    {dot && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#febc2e", boxShadow: "0 0 5px rgba(254,188,46,0.5)" }} />}
    </div>
    {subtitle && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.18)", fontFamily: "'DM Mono', monospace" }}>{subtitle}</span>}
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>{children}</div>
    </div>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function Dashboard({ T, tm, pending, allPendingCount, onNavigate }) {
  const warnings = [
    { msg: "home-manager input is outdated", level: "warn" },
    { msg: "flake-utils input is outdated", level: "warn" },
  ];
  const stats = [
    { label: "CPU", value: "12%", icon: Icons.cpu, color: T.green },
    { label: "Memory", value: "4.2 GB", icon: Icons.memory, color: T.accent },
    { label: "Disk", value: "68%", icon: Icons.disk, color: "#f5a623" },
    { label: "Generation", value: "#47", icon: Icons.generations, color: T.accent },
  ];
  return (
    <div style={{ display: "flex", height: "100%" }}>
    <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
    <div style={{ marginBottom: "20px" }}>
    <div style={{ fontSize: tm ? "13px" : "18px", fontWeight: tm ? 400 : 700, marginBottom: "4px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", letterSpacing: tm ? "0.05em" : "-0.02em" }}>
    {tm ? "floe dashboard" : "System Dashboard"}
    </div>
    <div style={{ fontSize: "12px", color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
    {tm ? "nixos · generation 47 · last rebuilt 2024-02-15" : "NixOS · Generation 47 · Last rebuilt Feb 15, 2024"}
    </div>
    </div>

    {/* Stats grid */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
    {stats.map(s => (
      <div key={s.label} style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: T.radius, padding: "14px 16px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: tm ? "2px" : "8px",
        background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center",
        color: s.color, flexShrink: 0,
      }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d={s.icon} /></svg>
      </div>
      <div>
      <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "'DM Mono', monospace", color: s.color }}>{s.value}</div>
      <div style={{ fontSize: "11px", color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>{s.label}</div>
      </div>
      </div>
    ))}
    </div>

    {/* Warnings */}
    {warnings.length > 0 && (
      <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textFaint, marginBottom: "8px", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
      {tm ? "warnings" : "Warnings"}
      </div>
      {warnings.map((w, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: "9px",
          padding: "9px 12px", borderRadius: tm ? "2px" : "8px",
          background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)",
                               marginBottom: "6px", fontSize: "12px", color: "#f5a623",
                               fontFamily: tm ? "'DM Mono', monospace" : "inherit",
        }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={Icons.alert} /></svg>
        {w.msg}
        </div>
      ))}
      </div>
    )}

    {/* Quick actions */}
    <div>
    <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textFaint, marginBottom: "8px", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
    {tm ? "quick actions" : "Quick Actions"}
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
    {[
      { label: tm ? "update inputs" : "Update Flake Inputs", screen: "flakes" },
      { label: tm ? "manage packages" : "Manage Packages", screen: "packages" },
      { label: tm ? "view generations" : "View Generations", screen: "generations" },
      { label: tm ? "edit options" : "Edit NixOS Options", screen: "options" },
    ].map(a => (
      <button key={a.label} onClick={() => onNavigate(a.screen)} style={{
        padding: "7px 13px", borderRadius: tm ? "2px" : "7px", fontSize: "12px",
        background: T.surfaceAlt, border: `1px solid ${T.border}`,
        color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit",
        transition: "all 0.12s",
      }}>{a.label}</button>
    ))}
    </div>
    </div>
    </div>

    {/* Right: system info */}
    <div style={{ width: "48%", borderLeft: `1px solid ${T.border}`, background: T.codeBg }}>
    <RightPanel title="system.info" subtitle="current generation" T={T}>
    <NixCode theme={T.theme} code={`# Current system state
      # Generation 47 — 2024-02-15 14:32

      {
        system = {
          hostname = "nixos";
          kernel = "6.7.4";
          stateVersion = "24.05";
          generation = 47;
          configType = "flake";
        };

        resources = {
          cpu.usage = "12%";
          memory.used = "4.2 GB";
          memory.total = "16 GB";
          disk.used = "68%";
          disk.total = "512 GB";
        };

        packages = {
          installed = 42;
          store.size = "18.4 GB";
          generations = 6;
        };

        inputs = {
          nixpkgs = "nixos-unstable";
          nixpkgs.rev = "abc123f";
          home-manager.rev = "def456a";
          # home-manager: update available
        };
      }`} />
      </RightPanel>
      </div>
      </div>
  );
}

function Packages({ T, tm, installedSet, setInstalledSet, pending, setPending, configType, addedPkgs, removedPkgs }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(PACKAGES.slice(0, 12));
  const configRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults(PACKAGES.slice(0, 12)); return; }
    const q = query.toLowerCase();
    setResults(PACKAGES.filter(p => p.name.includes(q) || p.description.toLowerCase().includes(q)));
  }, [query]);

  useEffect(() => {
    if (configRef.current) configRef.current.scrollTop = configRef.current.scrollHeight;
  }, [pending, installedSet]);

    const getPkg = (attr) => pending.find(p => p.attr === attr && p.screen === "packages");
    const toggle = (pkg) => {
      if (getPkg(pkg.attr)) { setPending(prev => prev.filter(p => !(p.attr === pkg.attr && p.screen === "packages"))); return; }
      setPending(prev => [...prev, { ...pkg, action: installedSet.has(pkg.attr) ? "remove" : "add", screen: "packages" }]);
    };

    const previewInstalled = new Set([
      ...Array.from(installedSet).filter(a => !removedPkgs.has(a)),
                                     ...Array.from(addedPkgs),
    ]);
    const configText = generatePkgConfig(previewInstalled, configType);

    return (
      <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: "52%", display: "flex", flexDirection: "column", overflow: "hidden", borderRight: `1px solid ${T.border}` }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "9px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "0 13px", height: "41px", marginBottom: "11px" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder={tm ? "search packages..." : "Search 80,000+ packages..."} style={{ flex: 1, background: "none", border: "none", fontSize: "13.5px", color: T.text, fontFamily: T.font, outline: "none" }} />
      {query && <button onClick={() => setQuery("")} style={{ color: T.textMuted, cursor: "pointer", border: "none", background: "none", display: "flex" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>}
      <span style={{ fontSize: "10.5px", color: T.textFaint, fontFamily: "'DM Mono', monospace" }}>{results.length}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 78px 34px", padding: "0 11px 5px", fontSize: "10px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: T.textFaint, fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
      <span>Package</span><span>Version</span><span></span>
      </div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
      {results.map((pkg, i) => {
        const isInstalled = installedSet.has(pkg.attr);
        const p = getPkg(pkg.attr);
        return (
          <div key={pkg.attr} style={{
            display: "grid", gridTemplateColumns: "1fr 78px 34px", alignItems: "center",
            padding: "9px 11px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
            background: p ? (p.action === "add" ? T.greenSoft : T.redSoft) : "transparent",
                transition: "background 0.1s", cursor: "default",
          }}>
          <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "1px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: tm ? 400 : 600, fontFamily: "'DM Mono', monospace", color: p?.action === "remove" ? T.red : (p?.action === "add" || isInstalled) ? T.green : T.text }}>{pkg.name}</span>
          {isInstalled && !p && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: T.greenSoft, color: T.green, border: `1px solid rgba(52,199,123,0.2)`, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>installed</span>}
          {p && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: p.action === "add" ? T.greenSoft : T.redSoft, color: p.action === "add" ? T.green : T.red, border: `1px solid ${p.action === "add" ? "rgba(52,199,123,0.2)" : "rgba(240,96,96,0.2)"}`, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{p.action === "add" ? "+adding" : "−removing"}</span>}
          </div>
          <div style={{ fontSize: "11px", color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>{pkg.description}</div>
          </div>
          <div style={{ fontSize: "11px", color: T.textFaint, fontFamily: "'DM Mono', monospace" }}>{pkg.version}</div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => toggle(pkg)} style={{ width: "27px", height: "27px", borderRadius: tm ? "2px" : "7px", display: "flex", alignItems: "center", justifyContent: "center", background: p ? (p.action === "add" ? T.greenSoft : T.redSoft) : isInstalled ? T.redSoft : T.accentSoft, color: p ? (p.action === "add" ? T.green : T.red) : isInstalled ? T.red : T.accent, border: `1px solid ${p ? (p.action === "add" ? "rgba(52,199,123,0.25)" : "rgba(240,96,96,0.25)") : isInstalled ? "rgba(240,96,96,0.2)" : "rgba(91,141,238,0.2)"}`, cursor: "pointer", transition: "all 0.1s" }}>
          {p ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            : isInstalled ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>
            : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>}
            </button>
            </div>
            </div>
        );
      })}
      </div>
      </div>
      <div style={{ padding: "7px 14px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: T.textFaint, background: T.surface, fontFamily: "'DM Mono', monospace" }}>
      <span>{configType === "flake" ? "~/nix-config/flake.nix" : "/etc/nixos/configuration.nix"}</span>
      {pending.filter(p => p.screen === "packages").length > 0 && (
        <span>
        {addedPkgs.size > 0 && <span style={{ color: T.green }}>+{addedPkgs.size} </span>}
        {removedPkgs.size > 0 && <span style={{ color: T.red }}>−{removedPkgs.size} </span>}
        pending
        </span>
      )}
      </div>
      </div>
      <div ref={configRef} style={{ width: "48%", overflowY: "auto", background: T.codeBg }}>
      <RightPanel title={configType === "flake" ? "flake.nix" : "configuration.nix"} subtitle="live preview" dot={pending.filter(p=>p.screen==="packages").length > 0} T={T}>
      <NixCode code={configText} addedLines={addedPkgs} removedLines={removedPkgs} theme={T.theme} />
      </RightPanel>
      </div>
      </div>
    );
}

function Shells({ T, tm, pending, setPending }) {
  const [selected, setSelected] = useState("bash");
  const shellPending = pending.filter(p => p.screen === "shells");

  const toggleShell = (shell) => {
    const existing = pending.find(p => p.screen === "shells" && p.id === shell.id);
    if (existing) { setPending(prev => prev.filter(p => !(p.screen === "shells" && p.id === shell.id))); return; }
    setPending(prev => [...prev, { ...shell, screen: "shells", action: shell.active ? "disable" : "enable" }]);
  };

  const setDefault = (shell) => {
    const existing = pending.find(p => p.screen === "shells" && p.id === shell.id + "_default");
    if (existing) { setPending(prev => prev.filter(p => !(p.screen === "shells" && p.id === shell.id + "_default"))); return; }
    if (!shell.default) setPending(prev => [...prev, { ...shell, id: shell.id + "_default", screen: "shells", action: "set-default" }]);
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
    <div style={{ width: "52%", display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>
    <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
    <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textFaint, marginBottom: "10px", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
    {tm ? "shell environments" : "Shell Environments"}
    </div>
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
    {SHELLS.map((shell, i) => {
      const p = pending.find(px => px.screen === "shells" && px.id === shell.id);
      const isActive = shell.active;
      return (
        <div key={shell.id} onClick={() => setSelected(shell.id)} style={{
          padding: "12px 14px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
          background: selected === shell.id ? T.surfaceAlt : p ? (p.action === "enable" ? T.greenSoft : T.redSoft) : "transparent",
              cursor: "pointer", transition: "background 0.1s",
        }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: tm ? 400 : 600, fontSize: "13px", color: isActive ? T.green : T.text }}>{shell.name}</span>
        {shell.default && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: T.accentSoft, color: T.accent, border: `1px solid rgba(91,141,238,0.2)`, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>default</span>}
        {isActive && !shell.default && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: T.greenSoft, color: T.green, border: `1px solid rgba(52,199,123,0.2)`, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>active</span>}
        {p && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: p.action === "enable" ? T.greenSoft : T.redSoft, color: p.action === "enable" ? T.green : T.red, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{p.action}</span>}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
        {!shell.default && (
          <button onClick={e => { e.stopPropagation(); setDefault(shell); }} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: tm ? "1px" : "5px", background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textMuted, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
          {tm ? "set default" : "Set Default"}
          </button>
        )}
        <button onClick={e => { e.stopPropagation(); toggleShell(shell); }} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: tm ? "1px" : "5px", background: isActive ? T.redSoft : T.greenSoft, border: `1px solid ${isActive ? "rgba(240,96,96,0.2)" : "rgba(52,199,123,0.2)"}`, color: isActive ? T.red : T.green, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
        {isActive ? (tm ? "disable" : "Disable") : (tm ? "enable" : "Enable")}
        </button>
        </div>
        </div>
        <div style={{ fontSize: "11.5px", color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>{shell.description}</div>
        <div style={{ fontSize: "10.5px", color: T.textFaint, fontFamily: "'DM Mono', monospace", marginTop: "2px" }}>{shell.file}</div>
        </div>
      );
    })}
    </div>
    </div>
    <div style={{ padding: "7px 14px", borderTop: `1px solid ${T.border}`, fontSize: "10.5px", color: T.textFaint, background: T.surface, fontFamily: "'DM Mono', monospace" }}>
    shells/{selected}.nix
    {shellPending.length > 0 && <span style={{ float: "right", color: T.accent }}>{shellPending.length} pending</span>}
    </div>
    </div>
    <div style={{ width: "48%", background: T.codeBg }}>
    <RightPanel title={`shells/${selected}.nix`} subtitle="shell config" T={T}>
    <NixCode code={SHELL_CONFIGS[selected] || "# Select a shell"} theme={T.theme} />
    </RightPanel>
    </div>
    </div>
  );
}

function NixOptions({ T, tm, pending, setPending }) {
  const [selected, setSelected] = useState(NIX_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const filtered = search ? NIX_OPTIONS.filter(o => o.key.toLowerCase().includes(search.toLowerCase()) || o.description.toLowerCase().includes(search.toLowerCase())) : NIX_OPTIONS;
  const categories = [...new Set(filtered.map(o => o.category))];
  const optPending = pending.filter(p => p.screen === "options");

  const toggleOption = (opt) => {
    const ex = pending.find(p => p.screen === "options" && p.key === opt.key);
    if (ex) { setPending(prev => prev.filter(p => !(p.screen === "options" && p.key === opt.key))); return; }
    setPending(prev => [...prev, { ...opt, screen: "options", action: "modify" }]);
  };

  const optionConfig = `# nixos option: ${selected.key}
  #
  # ${selected.description}
  #
  # Type:    ${selected.type}
  # Default: ${selected.default}
  # Example: ${selected.example}

  {
    ${selected.key} = ${selected.value};
  }`;

  return (
    <div style={{ display: "flex", height: "100%" }}>
    <div style={{ width: "52%", display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>
    <div style={{ padding: "12px 14px 0", flexShrink: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: "9px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "0 13px", height: "38px", marginBottom: "12px" }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tm ? "search options..." : "Search NixOS options..."} style={{ flex: 1, background: "none", border: "none", fontSize: "13px", color: T.text, fontFamily: T.font, outline: "none" }} />
    </div>
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 14px" }}>
    {categories.map(cat => (
      <div key={cat} style={{ marginBottom: "12px" }}>
      <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: T.textFaint, marginBottom: "6px", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>{cat}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
      {filtered.filter(o => o.category === cat).map((opt, i, arr) => {
        const p = pending.find(px => px.screen === "options" && px.key === opt.key);
        return (
          <div key={opt.key} onClick={() => setSelected(opt)} style={{
            padding: "9px 12px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
            background: selected?.key === opt.key ? T.surfaceAlt : p ? T.accentSoft : "transparent",
            cursor: "pointer", transition: "background 0.1s",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
          <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: tm ? 400 : 500, color: p ? T.accent : T.text, marginBottom: "1px" }}>{opt.key}</div>
          <div style={{ fontSize: "11px", color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>{opt.description}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "10px" }}>
          <span style={{ fontSize: "10.5px", fontFamily: "'DM Mono', monospace", color: T.accent, background: T.accentSoft, padding: "2px 6px", borderRadius: tm ? "1px" : "4px" }}>{opt.value}</span>
          {!p ? (
            <button onClick={e => { e.stopPropagation(); toggleOption(opt); }} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: tm ? "1px" : "5px", background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textMuted, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
            {tm ? "edit" : "Edit"}
            </button>
          ) : (
            <button onClick={e => { e.stopPropagation(); toggleOption(opt); }} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: tm ? "1px" : "5px", background: T.accentSoft, border: `1px solid rgba(91,141,238,0.25)`, color: T.accent, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
            {tm ? "undo" : "Undo"}
            </button>
          )}
          </div>
          </div>
        );
      })}
      </div>
      </div>
    ))}
    </div>
    <div style={{ padding: "7px 14px", borderTop: `1px solid ${T.border}`, fontSize: "10.5px", color: T.textFaint, background: T.surface, fontFamily: "'DM Mono', monospace" }}>
    nixos options
    {optPending.length > 0 && <span style={{ float: "right", color: T.accent }}>{optPending.length} pending</span>}
    </div>
    </div>
    <div style={{ width: "48%", background: T.codeBg }}>
    <RightPanel title="option.nix" subtitle={selected?.key} T={T}>
    <NixCode code={optionConfig} theme={T.theme} />
    </RightPanel>
    </div>
    </div>
  );
}

function Flakes({ T, tm, pending, setPending }) {
  const flakePending = pending.filter(p => p.screen === "flakes");

  const queueUpdate = (input) => {
    const ex = pending.find(p => p.screen === "flakes" && p.name === input.name);
    if (ex) { setPending(prev => prev.filter(p => !(p.screen === "flakes" && p.name === input.name))); return; }
    setPending(prev => [...prev, { ...input, screen: "flakes", action: "update" }]);
  };

  const flakeConfig = `# flake.nix — inputs
  {
    inputs = {
      ${FLAKE_INPUTS.map(i => {
        const p = pending.find(px => px.screen === "flakes" && px.name === i.name);
        return `    # ${i.name}${i.outdated ? " ⚠ update available" : " ✓ current"}${p ? " → updating" : ""}
        ${i.name}.url = "${i.url}";`;
      }).join("\n\n")}
    };
  }`;

  return (
    <div style={{ display: "flex", height: "100%" }}>
    <div style={{ width: "52%", display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>
    <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
    <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textFaint, fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
    {tm ? "flake inputs" : "Flake Inputs"}
    </div>
    <button onClick={() => FLAKE_INPUTS.filter(i => i.outdated).forEach(queueUpdate)} style={{
      fontSize: "11px", padding: "4px 10px", borderRadius: tm ? "2px" : "6px",
      background: T.accentSoft, border: `1px solid rgba(91,141,238,0.2)`,
          color: T.accent, cursor: "pointer", fontFamily: "'DM Mono', monospace",
          display: "flex", alignItems: "center", gap: "5px",
    }}>
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={Icons.refresh} /></svg>
    {tm ? "update all" : "Update All"}
    </button>
    </div>
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
    {FLAKE_INPUTS.map((input, i) => {
      const p = pending.find(px => px.screen === "flakes" && px.name === input.name);
      return (
        <div key={input.name} style={{
          padding: "12px 14px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
          background: p ? T.accentSoft : input.outdated ? "rgba(245,166,35,0.04)" : "transparent",
        }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: tm ? 400 : 600, fontSize: "13px" }}>{input.name}</span>
        {input.outdated && !p && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: "rgba(245,166,35,0.1)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.2)", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>outdated</span>}
        {!input.outdated && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: T.greenSoft, color: T.green, border: `1px solid rgba(52,199,123,0.2)`, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>current</span>}
        {p && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: T.accentSoft, color: T.accent, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>updating</span>}
        </div>
        <button onClick={() => queueUpdate(input)} style={{
          fontSize: "10px", padding: "3px 9px", borderRadius: tm ? "1px" : "5px",
          background: p ? T.accentSoft : input.outdated ? "rgba(245,166,35,0.08)" : T.surfaceAlt,
              border: `1px solid ${p ? "rgba(91,141,238,0.25)" : input.outdated ? "rgba(245,166,35,0.2)" : T.border}`,
              color: p ? T.accent : input.outdated ? "#f5a623" : T.textMuted,
              cursor: "pointer", fontFamily: "'DM Mono', monospace",
        }}>
        {p ? (tm ? "undo" : "Undo") : (tm ? "update" : "Update")}
        </button>
        </div>
        <div style={{ fontSize: "11px", color: T.textMuted, fontFamily: "'DM Mono', monospace", marginBottom: "2px" }}>{input.url}</div>
        <div style={{ fontSize: "10.5px", color: T.textFaint, fontFamily: "'DM Mono', monospace" }}>
        locked {input.locked} · rev {input.rev}
        </div>
        </div>
      );
    })}
    </div>
    </div>
    <div style={{ padding: "7px 14px", borderTop: `1px solid ${T.border}`, fontSize: "10.5px", color: T.textFaint, background: T.surface, fontFamily: "'DM Mono', monospace" }}>
    flake.lock
    {flakePending.length > 0 && <span style={{ float: "right", color: T.accent }}>{flakePending.length} inputs pending</span>}
    </div>
    </div>
    <div style={{ width: "48%", background: T.codeBg }}>
    <RightPanel title="flake.nix" subtitle="inputs" dot={flakePending.length > 0} T={T}>
    <NixCode code={flakeConfig} theme={T.theme} />
    </RightPanel>
    </div>
    </div>
  );
}

function Generations({ T, tm, pending, setPending }) {
  const [selected, setSelected] = useState(GENERATIONS[0]);
  const genPending = pending.find(p => p.screen === "generations");

  const queueRollback = (gen) => {
    if (gen.current) return;
    const ex = pending.find(p => p.screen === "generations");
    if (ex?.id === gen.id) { setPending(prev => prev.filter(p => p.screen !== "generations")); return; }
    setPending(prev => [...prev.filter(p => p.screen !== "generations"), { ...gen, screen: "generations", action: "rollback" }]);
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
    <div style={{ width: "52%", display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>
    <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
    <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textFaint, marginBottom: "10px", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
    {tm ? "system generations" : "System Generations"}
    </div>
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
    {GENERATIONS.map((gen, i) => {
      const isRollbackTarget = genPending?.id === gen.id;
      return (
        <div key={gen.id} onClick={() => setSelected(gen)} style={{
          padding: "11px 14px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
          background: selected?.id === gen.id ? T.surfaceAlt : isRollbackTarget ? T.accentSoft : gen.current ? T.greenSoft : "transparent",
          cursor: "pointer", transition: "background 0.1s",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
        <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: tm ? 400 : 700, fontSize: "14px", color: gen.current ? T.green : isRollbackTarget ? T.accent : T.text }}>
        #{gen.id}
        </span>
        {gen.current && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: T.greenSoft, color: T.green, border: `1px solid rgba(52,199,123,0.2)`, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>current</span>}
        {isRollbackTarget && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: T.accentSoft, color: T.accent, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>rollback queued</span>}
        </div>
        <div style={{ fontSize: "11.5px", color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit", marginBottom: "2px" }}>{gen.desc}</div>
        <div style={{ fontSize: "10.5px", color: T.textFaint, fontFamily: "'DM Mono', monospace" }}>
        {gen.date} · {gen.pkgCount} pkgs · linux {gen.kernel}
        </div>
        </div>
        {!gen.current && (
          <button onClick={e => { e.stopPropagation(); queueRollback(gen); }} style={{
            fontSize: "10px", padding: "4px 10px", borderRadius: tm ? "1px" : "6px",
            background: isRollbackTarget ? T.accentSoft : T.surfaceAlt,
            border: `1px solid ${isRollbackTarget ? "rgba(91,141,238,0.25)" : T.border}`,
                          color: isRollbackTarget ? T.accent : T.textMuted,
                          cursor: "pointer", fontFamily: "'DM Mono', monospace",
                          display: "flex", alignItems: "center", gap: "5px", flexShrink: 0, marginLeft: "10px",
          }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={Icons.rollback} /></svg>
          {isRollbackTarget ? (tm ? "undo" : "Undo") : (tm ? "rollback" : "Rollback")}
          </button>
        )}
        </div>
      );
    })}
    </div>
    </div>
    <div style={{ padding: "7px 14px", borderTop: `1px solid ${T.border}`, fontSize: "10.5px", color: T.textFaint, background: T.surface, fontFamily: "'DM Mono', monospace" }}>
    generations
    {genPending && <span style={{ float: "right", color: T.accent }}>rollback to #{genPending.id} queued</span>}
    </div>
    </div>
    <div style={{ width: "48%", background: T.codeBg }}>
    <RightPanel title={`generation-${selected?.id}.nix`} subtitle={selected?.date} T={T}>
    <NixCode code={GEN_CONFIGS(selected?.id || 47)} theme={T.theme} />
    </RightPanel>
    </div>
    </div>
  );
}

// ─── CONFIG GENERATORS ────────────────────────────────────────────────────────

function generatePkgConfig(installedSet, configType) {
  const pkgs = Array.from(installedSet).map(a => `    ${a}`).join("\n");
  if (configType === "flake") return `# flake.nix\n{\n  description = "NixOS system configuration";\n\n  inputs = {\n    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";\n    home-manager = {\n      url = "github:nix-community/home-manager";\n      inputs.nixpkgs.follows = "nixpkgs";\n    };\n  };\n\n  outputs = { self, nixpkgs, ... }: {\n    nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {\n      system = "x86_64-linux";\n      modules = [\n        ./hardware-configuration.nix\n        {\n          environment.systemPackages = with pkgs; [\n${pkgs}\n          ];\n\n          networking.hostName = "nixos";\n          networking.firewall.enable = true;\n\n          system.stateVersion = "24.05";\n        }\n      ];\n    };\n  };\n}`;
  return `# /etc/nixos/configuration.nix\n{ config, pkgs, ... }:\n\n{\n  imports = [\n    ./hardware-configuration.nix\n  ];\n\n  networking.hostName = "nixos";\n  networking.firewall.enable = true;\n\n  environment.systemPackages = with pkgs; [\n${pkgs}\n  ];\n\n  boot.loader.systemd-boot.enable = true;\n  boot.loader.efi.canTouchEfiVariables = true;\n\n  system.stateVersion = "24.05";\n}`;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: Icons.dashboard },
{ id: "packages", label: "Packages", icon: Icons.packages },
{ id: "shells", label: "Shells", icon: Icons.shells },
{ id: "options", label: "Options", icon: Icons.options },
{ id: "flakes", label: "Flakes", icon: Icons.flakes },
{ id: "generations", label: "Generations", icon: Icons.generations },
];

export default function Floe() {
  const [screen, setScreen] = useState("dashboard");
  const [dark, setDark] = useState(true);
  const [terminalMode, setTerminalMode] = useState(false);
  const [configType, setConfigType] = useState("flake");
  const [installedSet, setInstalledSet] = useState(new Set(BASE_INSTALLED));
  const [pending, setPending] = useState([]);
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildDone, setRebuildDone] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);
  const [showRebuildPanel, setShowRebuildPanel] = useState(false);
  const termRef = useRef(null);

  const isDark = dark || terminalMode;
  const tm = terminalMode;

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [terminalLines]);

    const addedPkgs = new Set(pending.filter(p => p.screen === "packages" && p.action === "add").map(p => p.attr));
    const removedPkgs = new Set(pending.filter(p => p.screen === "packages" && p.action === "remove").map(p => p.attr));

    const pendingByScreen = NAV.reduce((acc, n) => {
      acc[n.id] = pending.filter(p => p.screen === n.id).length;
      return acc;
    }, {});
    const totalPending = pending.length;

    const handleRebuild = async () => {
      if (pending.length === 0) return;
      setRebuilding(true); setRebuildDone(false); setShowRebuildPanel(true); setTerminalLines([]);
      const genPending = pending.find(p => p.screen === "generations");
      const lines = genPending
      ? [`$ sudo nixos-rebuild switch --rollback`, `rolling back to generation ${genPending.id}...`, `activating generation ${genPending.id}...`, `✓ rolled back to generation ${genPending.id}`]
      : [`$ sudo nixos-rebuild switch${configType === "flake" ? " --flake .#nixos" : ""}`,
      "evaluating Nix expressions...",
      "building derivations...",
      ...pending.filter(p => p.screen === "packages").map(p => `  ${p.action === "add" ? "fetching" : "removing"} ${p.name}`),
      ...pending.filter(p => p.screen === "flakes").map(p => `  updating ${p.name} input`),
      ...pending.filter(p => p.screen === "options").map(p => `  applying ${p.key}`),
      "activating configuration...",
      `✓ switched to generation ${Math.floor(Math.random() * 8) + 47}`];

      for (const line of lines) {
        await new Promise(r => setTimeout(r, 150 + Math.random() * 100));
        setTerminalLines(prev => [...prev, line]);
      }
      const next = new Set(installedSet);
      pending.filter(p => p.screen === "packages").forEach(p => { if (p.action === "add") next.add(p.attr); else next.delete(p.attr); });
      setInstalledSet(next);
      setPending([]);
      setRebuilding(false);
      setRebuildDone(true);
    };

    // Theme
    const T = terminalMode ? {
      bg: "#080c08", surface: "#0c110c", surfaceAlt: "#111811",
      border: "#1a2a1a", text: "#33ff33", textMuted: "#1f9e1f",
      textFaint: "#145014", accent: "#33ff33", accentSoft: "rgba(51,255,51,0.07)",
      green: "#33ff33", greenSoft: "rgba(51,255,51,0.07)",
      red: "#ff4444", redSoft: "rgba(255,68,68,0.07)",
      codeBg: "#060a06", font: "'DM Mono', monospace", radius: "2px", theme: "terminal",
    } : isDark ? {
      bg: "#0e1117", surface: "#161b24", surfaceAlt: "#1c2333",
      border: "#2a3347", text: "#e8eaf0", textMuted: "#8892a4",
      textFaint: "#4a5568", accent: "#5b8dee", accentSoft: "rgba(91,141,238,0.12)",
      green: "#34c77b", greenSoft: "rgba(52,199,123,0.1)",
      red: "#f06060", redSoft: "rgba(240,96,96,0.1)",
      codeBg: "#0a0d14", font: "'DM Sans', system-ui, sans-serif", radius: "10px", theme: "dark",
    } : {
      bg: "#f5f5f1", surface: "#ffffff", surfaceAlt: "#f8f8f5",
      border: "#e4e4df", text: "#1a1a1a", textMuted: "#6b7280",
      textFaint: "#9ca3af", accent: "#5b8dee", accentSoft: "rgba(91,141,238,0.08)",
      green: "#34c77b", greenSoft: "rgba(52,199,123,0.08)",
      red: "#f06060", redSoft: "rgba(240,96,96,0.08)",
      codeBg: "#1a1a2e", font: "'DM Sans', system-ui, sans-serif", radius: "10px", theme: "light",
    };

    const currentNav = NAV.find(n => n.id === screen);

    return (
      <div style={{ fontFamily: T.font, background: T.bg, height: "100vh", color: T.text, display: "flex", flexDirection: "column", transition: "all 0.18s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
        input { outline: none; }
        button { cursor: pointer; border: none; background: none; font-family: inherit; }
        .nav-item { transition: all 0.12s; }
        .nav-item:hover { background: ${T.surfaceAlt} !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes fadein { from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none} }
        .fadein { animation: fadein 0.18s ease forwards; }
        `}</style>

        {/* Top header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px 0 0", height: "50px", flexShrink: 0,
          borderBottom: `1px solid ${T.border}`, background: T.surface,
        }}>
        {/* Logo area — matches sidebar width */}
        <div style={{
          width: "64px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          borderRight: `1px solid ${T.border}`, flexShrink: 0,
        }}>
        {tm
          ? <span style={{ color: T.green, fontSize: "20px", fontFamily: "'DM Mono', monospace" }}>❄</span>
          : <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
          <path d="M50 15 L62 36 L74 15 L62 15 Z" fill="#7ebae4"/>
          <path d="M50 15 L38 36 L26 15 L38 15 Z" fill="#5277c3"/>
          <path d="M74 15 L62 36 L74 57 L80 46 Z" fill="#7ebae4"/>
          <path d="M26 15 L38 36 L26 57 L20 46 Z" fill="#5277c3"/>
          <path d="M74 57 L62 36 L50 57 L62 57 Z" fill="#5277c3"/>
          <path d="M26 57 L38 36 L50 57 L38 57 Z" fill="#7ebae4"/>
          <path d="M50 57 L38 78 L50 99 L62 78 Z" fill="#7ebae4"/>
          <path d="M50 57 L62 78 L50 99 L38 78 Z" fill="#5277c3"/>
          </svg>
        }
        </div>

        {/* Title */}
        <div style={{ flex: 1, paddingLeft: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontWeight: tm ? 400 : 700, fontSize: "15px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", letterSpacing: tm ? "0.05em" : "-0.02em" }}>
        {tm ? "floe" : <><span style={{ color: T.text }}>nix</span><span style={{ color: T.accent }}>floe</span></>}
        </span>
        <span style={{ fontSize: "11px", color: T.textMuted, fontFamily: "'DM Mono', monospace", background: T.surfaceAlt, padding: "2px 7px", borderRadius: T.radius, border: `1px solid ${T.border}` }}>
        {currentNav?.label || ""}
        </span>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        {/* Config type */}
        <div style={{ display: "flex", gap: "2px", background: T.surfaceAlt, borderRadius: T.radius, padding: "3px", border: `1px solid ${T.border}` }}>
        {["flake", "classic"].map(t => (
          <button key={t} onClick={() => setConfigType(t)} style={{
            padding: "3px 10px", borderRadius: tm ? "1px" : "6px", fontSize: "11px", fontWeight: 500,
            color: configType === t ? T.text : T.textMuted,
            background: configType === t ? (isDark ? "#2a3347" : "#fff") : "transparent",
                                        boxShadow: configType === t && !tm ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                                        transition: "all 0.12s", fontFamily: tm ? "'DM Mono', monospace" : "inherit",
          }}>{t}</button>
        ))}
        </div>

        {/* Terminal mode toggle */}
        <button onClick={() => setTerminalMode(!tm)} style={{
          padding: "4px 11px", borderRadius: T.radius, fontSize: "11px",
          background: tm ? T.accentSoft : T.surfaceAlt,
          border: `1px solid ${tm ? T.accent : T.border}`,
          color: tm ? T.accent : T.textMuted,
          fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
        }}>{tm ? "~/term" : "> term"}</button>

        {!tm && (
          <button onClick={() => setDark(!dark)} style={{ width: "30px", height: "30px", borderRadius: T.radius, background: T.surfaceAlt, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>
          {isDark ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>
        )}

        {/* Global rebuild button */}
        <button onClick={handleRebuild} disabled={rebuilding || totalPending === 0} style={{
          padding: "6px 14px", borderRadius: tm ? "2px" : "8px", fontSize: "12px",
          fontWeight: tm ? 400 : 600,
          color: totalPending === 0 ? T.textFaint : tm ? T.green : "#fff",
          background: totalPending === 0 ? T.surfaceAlt : tm ? "transparent" : (rebuilding ? "#4a5568" : T.accent),
            border: tm ? `1px solid ${totalPending === 0 ? T.border : T.green}` : "none",
            display: "flex", alignItems: "center", gap: "6px",
            fontFamily: tm ? "'DM Mono', monospace" : "inherit",
            opacity: totalPending === 0 ? 0.5 : 1, transition: "all 0.15s",
        }}>
        {rebuilding
          ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>{tm ? " rebuilding..." : " Rebuilding..."}</>
          : <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          {totalPending > 0 ? (tm ? `rebuild (${totalPending})` : `Rebuild (${totalPending})`) : (tm ? "rebuild" : "Rebuild")}
          </>
        }
        </button>
        </div>
        </div>

        {/* Body: sidebar + content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{
          width: "64px", flexShrink: 0, borderRight: `1px solid ${T.border}`,
          background: T.surface, display: "flex", flexDirection: "column",
          paddingTop: "8px", gap: "2px",
        }}>
        {NAV.map(n => {
          const cnt = pendingByScreen[n.id] || 0;
          const active = screen === n.id;
          return (
            <button key={n.id} className="nav-item" onClick={() => setScreen(n.id)} title={n.label} style={{
              width: "100%", padding: "10px 0", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "4px",
              background: active ? T.surfaceAlt : "transparent",
              borderLeft: active ? `2px solid ${T.accent}` : "2px solid transparent",
              color: active ? T.accent : T.textMuted,
              position: "relative",
            }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.7"} strokeLinecap="round" strokeLinejoin="round">
            <path d={n.icon} />
            </svg>
            <span style={{ fontSize: "9px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", fontWeight: active ? 600 : 400, letterSpacing: "0.02em" }}>
            {n.label.slice(0, 4).toLowerCase()}
            </span>
            {cnt > 0 && (
              <span style={{
                position: "absolute", top: "6px", right: "8px",
                width: "14px", height: "14px", borderRadius: "50%",
                background: T.accent, color: "#fff",
                fontSize: "8px", fontWeight: 700, fontFamily: "'DM Mono', monospace",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{cnt}</span>
            )}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* Pending summary at bottom of sidebar */}
        {totalPending > 0 && (
          <div style={{
            padding: "10px 6px", borderTop: `1px solid ${T.border}`,
            fontSize: "9px", fontFamily: "'DM Mono', monospace",
            color: T.accent, textAlign: "center", lineHeight: "1.5",
          }}>
          {Object.entries(pendingByScreen).filter(([, v]) => v > 0).map(([k, v]) => (
            <div key={k}>{k.slice(0,4)} <span style={{ fontWeight: 700 }}>{v}</span></div>
          ))}
          </div>
        )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Pending bar for current screen (if not dashboard) */}
        {screen !== "dashboard" && pending.filter(p => p.screen === screen).length > 0 && (
          <div className="fadein" style={{
            padding: "8px 16px", borderBottom: `1px solid ${T.border}`,
            background: T.surface, display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flexShrink: 0,
          }}>
          <span style={{ fontSize: "11px", color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
          {tm ? "pending" : "Pending"}
          </span>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", flex: 1 }}>
          {pending.filter(p => p.screen === screen).map((p, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "3px 8px", borderRadius: tm ? "2px" : "5px", fontSize: "11px",
              fontFamily: "'DM Mono', monospace",
              background: p.action === "add" || p.action === "enable" || p.action === "update" ? T.greenSoft : p.action === "rollback" || p.action === "modify" ? T.accentSoft : T.redSoft,
              color: p.action === "add" || p.action === "enable" || p.action === "update" ? T.green : p.action === "rollback" || p.action === "modify" ? T.accent : T.red,
              border: `1px solid rgba(0,0,0,0.1)`,
            }}>
            {p.action} {p.name || p.key || (p.id ? `#${p.id}` : "")}
            <button onClick={() => setPending(prev => prev.filter((_, j) => prev.indexOf(p) !== j))} style={{ color: "currentColor", opacity: 0.55, display: "flex" }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            </span>
          ))}
          </div>
          </div>
        )}

        {/* Rebuild complete banner */}
        {rebuildDone && totalPending === 0 && (
          <div className="fadein" style={{
            padding: "7px 16px", background: T.greenSoft, borderBottom: `1px solid rgba(52,199,123,0.2)`,
                                               display: "flex", alignItems: "center", gap: "7px", flexShrink: 0,
                                               fontSize: "12px", color: T.green, fontFamily: tm ? "'DM Mono', monospace" : "inherit",
          }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          {tm ? "rebuild complete" : "System rebuilt successfully"}
          </div>
        )}

        {/* Screen content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
        {screen === "dashboard" && <Dashboard T={T} tm={tm} pending={pending} allPendingCount={totalPending} onNavigate={setScreen} />}
        {screen === "packages" && <Packages T={T} tm={tm} installedSet={installedSet} setInstalledSet={setInstalledSet} pending={pending} setPending={setPending} configType={configType} addedPkgs={addedPkgs} removedPkgs={removedPkgs} />}
        {screen === "shells" && <Shells T={T} tm={tm} pending={pending} setPending={setPending} />}
        {screen === "options" && <NixOptions T={T} tm={tm} pending={pending} setPending={setPending} />}
        {screen === "flakes" && <Flakes T={T} tm={tm} pending={pending} setPending={setPending} />}
        {screen === "generations" && <Generations T={T} tm={tm} pending={pending} setPending={setPending} />}
        </div>

        {/* Rebuild terminal output */}
        {showRebuildPanel && (
          <div style={{ borderTop: `1px solid ${tm ? "#1a2a1a" : "rgba(255,255,255,0.06)"}`, background: T.codeBg, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 14px", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}>nixos-rebuild</span>
          <button onClick={() => setShowRebuildPanel(false)} style={{ color: "rgba(255,255,255,0.3)", display: "flex" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
          </div>
          <div ref={termRef} style={{ padding: "8px 16px", fontFamily: "'DM Mono', monospace", fontSize: "11.5px", lineHeight: "1.6", maxHeight: "130px", overflowY: "auto" }}>
          {terminalLines.map((line, i) => (
            <div key={i} style={{ color: line.startsWith("✓") ? T.green : line.startsWith("$") ? "#7ebae4" : line.startsWith("  ") ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.65)" }}>{line}</div>
          ))}
          {rebuilding && <span style={{ color: T.accent, animation: "blink 1s infinite" }}>▊</span>}
          </div>
          </div>
        )}
        </div>
        </div>
        </div>
    );
}
