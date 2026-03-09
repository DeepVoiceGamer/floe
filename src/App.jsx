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
  { attr: "pkgs.obsidian", name: "obsidian", version: "1.5.3", description: "A powerful knowledge base that works on local Markdown files", installed: false },
  { attr: "pkgs.kitty", name: "kitty", version: "0.32.2", description: "A fast, feature-rich, GPU-based terminal", installed: false },
];

const BASE_INSTALLED = new Set(["pkgs.ripgrep","pkgs.bat","pkgs.starship","pkgs.git"]);

const STACKS = [
  {
    id: "creation", name: "Creation", icon: "✦", color: "#a78bfa",
    description: "Digital art and design workflow",
    packages: ["pkgs.blender", "pkgs.krita", "pkgs.inkscape", "pkgs.gimp"],
    pkgNames: ["blender", "krita", "inkscape", "gimp"],
  },
  {
    id: "devtools", name: "Dev Tools", icon: "⌥", color: "#5b8dee",
    description: "Modern terminal development environment",
    packages: ["pkgs.neovim", "pkgs.lazygit", "pkgs.fzf", "pkgs.zoxide", "pkgs.bat", "pkgs.fd"],
    pkgNames: ["neovim", "lazygit", "fzf", "zoxide", "bat", "fd"],
  },
  {
    id: "gaming", name: "Gaming", icon: "◈", color: "#34c77b",
    description: "Linux gaming essentials",
    packages: ["pkgs.steam", "pkgs.lutris", "pkgs.gamemode", "pkgs.mangohud"],
    pkgNames: ["steam", "lutris", "gamemode", "mangohud"],
  },
  {
    id: "media", name: "Media", icon: "◎", color: "#f5a623",
    description: "Audio, video and multimedia production",
    packages: ["pkgs.vlc", "pkgs.obs-studio", "pkgs.ffmpeg", "pkgs.audacity"],
    pkgNames: ["vlc", "obs-studio", "ffmpeg", "audacity"],
  },
  {
    id: "writing", name: "Writing", icon: "◌", color: "#f06060",
    description: "Writing, notes and document editing",
    packages: ["pkgs.obsidian", "pkgs.libreoffice", "pkgs.pandoc", "pkgs.zathura"],
    pkgNames: ["obsidian", "libreoffice", "pandoc", "zathura"],
  },
  {
    id: "security", name: "Security", icon: "⬡", color: "#89ddff",
    description: "Security auditing and privacy tools",
    packages: ["pkgs.nmap", "pkgs.wireshark", "pkgs.gnupg", "pkgs.pass"],
    pkgNames: ["nmap", "wireshark", "gnupg", "pass"],
  },
];

const TEMPLATES = [
  {
    id: "bare",
    name: "Bare",
    icon: "○",
    color: "#4a5568",
    tagline: "Nothing but the essentials",
    description: "A minimal base system. No desktop environment, no extras. The foundation you build on top of.",
    pkgCount: 8,
    services: ["networking", "sshd"],
    shell: "bash",
    de: "none",
    config: `# templates/bare.nix
{ config, pkgs, ... }:
{
  imports = [ ./hardware-configuration.nix ];

  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;

  networking.hostName = "nixos";
  networking.networkmanager.enable = true;

  time.timeZone = "UTC";
  i18n.defaultLocale = "en_US.UTF-8";

  environment.systemPackages = with pkgs; [
    git
    curl
    vim
    wget
  ];

  system.stateVersion = "24.05";
}`,
  },
  {
    id: "entry",
    name: "Entry",
    icon: "◎",
    color: "#5b8dee",
    tagline: "Start here",
    description: "GNOME desktop with a sensible set of tools. Good for someone new to Linux or NixOS.",
    pkgCount: 34,
    services: ["networking", "xserver", "printing", "bluetooth"],
    shell: "bash",
    de: "GNOME",
    config: `# templates/entry.nix
{ config, pkgs, ... }:
{
  imports = [ ./hardware-configuration.nix ];

  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;

  networking.hostName = "nixos";
  networking.networkmanager.enable = true;

  services.xserver = {
    enable = true;
    displayManager.gdm.enable = true;
    desktopManager.gnome.enable = true;
  };

  services.printing.enable = true;
  hardware.bluetooth.enable = true;
  hardware.pulseaudio.enable = false;
  services.pipewire = {
    enable = true;
    alsa.enable = true;
    pulse.enable = true;
  };

  environment.systemPackages = with pkgs; [
    firefox git curl vim
    gnome.gnome-terminal
    gnome.nautilus
  ];

  system.stateVersion = "24.05";
}`,
  },
  {
    id: "workstation",
    name: "Workstation",
    icon: "◈",
    color: "#34c77b",
    tagline: "Get to work",
    description: "A full development workstation. Terminal-first workflow with a tiling window manager, development tools, and shell configuration.",
    pkgCount: 62,
    services: ["networking", "xserver", "docker", "openssh"],
    shell: "zsh",
    de: "Hyprland",
    config: `# templates/workstation.nix
{ config, pkgs, ... }:
{
  imports = [ ./hardware-configuration.nix ];

  boot.loader.systemd-boot.enable = true;
  boot.kernelPackages = pkgs.linuxPackages_latest;

  networking.hostName = "workstation";
  networking.networkmanager.enable = true;

  nix.settings.experimental-features = [
    "nix-command" "flakes"
  ];

  programs.hyprland.enable = true;

  environment.systemPackages = with pkgs; [
    neovim git ripgrep fd bat
    fzf zoxide starship tmux
    lazygit btop alacritty
    firefox
  ];

  programs.zsh.enable = true;
  users.defaultUserShell = pkgs.zsh;

  virtualisation.docker.enable = true;
  services.openssh.enable = true;

  system.stateVersion = "24.05";
}`,
  },
  {
    id: "creation",
    name: "Creation",
    icon: "✦",
    color: "#a78bfa",
    tagline: "Make things",
    description: "For artists, designers and makers. Includes creative software, audio tools, and a clean desktop optimised for visual work.",
    pkgCount: 48,
    services: ["networking", "xserver", "pipewire", "bluetooth"],
    shell: "fish",
    de: "KDE Plasma",
    config: `# templates/creation.nix
{ config, pkgs, ... }:
{
  imports = [ ./hardware-configuration.nix ];

  boot.loader.systemd-boot.enable = true;

  networking.hostName = "studio";
  networking.networkmanager.enable = true;

  services.xserver = {
    enable = true;
    displayManager.sddm.enable = true;
    desktopManager.plasma5.enable = true;
  };

  hardware.pulseaudio.enable = false;
  services.pipewire = {
    enable = true;
    jack.enable = true;
    pulse.enable = true;
  };

  environment.systemPackages = with pkgs; [
    blender krita inkscape gimp
    obs-studio kdenlive audacity
    firefox obsidian
    git
  ];

  programs.fish.enable = true;

  system.stateVersion = "24.05";
}`,
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: "⬡",
    color: "#f5a623",
    tagline: "Play",
    description: "Linux gaming setup with Steam, Lutris, GameMode, and GPU optimisations. Includes MangoHud and performance tuning.",
    pkgCount: 41,
    services: ["networking", "xserver", "steam", "gamemode"],
    shell: "bash",
    de: "GNOME",
    config: `# templates/gaming.nix
{ config, pkgs, ... }:
{
  imports = [ ./hardware-configuration.nix ];

  boot.loader.systemd-boot.enable = true;
  boot.kernelPackages = pkgs.linuxPackages_zen;

  networking.hostName = "gaming-rig";
  networking.networkmanager.enable = true;

  services.xserver = {
    enable = true;
    displayManager.gdm.enable = true;
    desktopManager.gnome.enable = true;
    videoDrivers = [ "nvidia" ];
  };

  hardware.opengl = {
    enable = true;
    driSupport = true;
    driSupport32Bit = true;
  };

  hardware.nvidia.modesetting.enable = true;

  programs.steam.enable = true;
  programs.gamemode.enable = true;

  environment.systemPackages = with pkgs; [
    lutris mangohud
    discord firefox
  ];

  system.stateVersion = "24.05";
}`,
  },
  {
    id: "tutorial",
    name: "Tutorial",
    icon: "◌",
    color: "#f06060",
    tagline: "Learn NixOS by doing",
    description: "A guided starting point. Every section is heavily commented to explain what it does and why. Designed for someone encountering NixOS for the first time.",
    pkgCount: 22,
    services: ["networking", "xserver"],
    shell: "bash",
    de: "GNOME",
    config: `# templates/tutorial.nix
#
# Welcome to NixOS. This file is your system configuration.
# Everything about your system is described here — packages,
# services, users, settings. Change this file and rebuild,
# and your system changes. That's it.
#
# Run: sudo nixos-rebuild switch
# to apply changes you make here.

{ config, pkgs, ... }:

{
  imports = [
    # This file describes your hardware. It was generated
    # automatically during installation. Don't edit it.
    ./hardware-configuration.nix
  ];

  # ── Boot ──────────────────────────────────────────────
  # systemd-boot is the recommended bootloader for NixOS
  # on modern EFI systems.
  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;

  # ── Networking ────────────────────────────────────────
  # Your machine's name on the network.
  networking.hostName = "nixos";

  # NetworkManager handles WiFi and ethernet connections.
  # It includes a GUI applet in most desktop environments.
  networking.networkmanager.enable = true;

  # ── Desktop ───────────────────────────────────────────
  # This enables the X display server and the GNOME
  # desktop environment.
  services.xserver = {
    enable = true;
    displayManager.gdm.enable = true;
    desktopManager.gnome.enable = true;
  };

  # ── Packages ──────────────────────────────────────────
  # These packages will be available system-wide.
  # Browse more packages at: https://search.nixos.org
  environment.systemPackages = with pkgs; [
    firefox   # web browser
    git       # version control
    vim       # text editor
    curl      # download tool
    htop      # process viewer
  ];

  # ── State Version ─────────────────────────────────────
  # This records which version of NixOS was used when
  # you first installed. Don't change it.
  system.stateVersion = "24.05";
}`,
  },
];

const HOME_MODULES = [
  {
    id: "git",
    name: "Git",
    category: "Development",
    enabled: true,
    description: "Version control configuration with sensible defaults",
    config: `# home/git.nix
{ config, pkgs, ... }:
{
  programs.git = {
    enable = true;
    userName = "Your Name";
    userEmail = "you@example.com";

    extraConfig = {
      init.defaultBranch = "main";
      pull.rebase = true;
      push.autoSetupRemote = true;
      core.editor = "nvim";
    };

    delta = {
      enable = true;
      options = {
        line-numbers = true;
        side-by-side = true;
      };
    };

    aliases = {
      lg = "log --oneline --graph --decorate";
      st = "status -sb";
      co = "checkout";
    };
  };
}`,
  },
  {
    id: "starship",
    name: "Starship",
    category: "Shell",
    enabled: true,
    description: "Cross-shell prompt with git, language, and status info",
    config: `# home/starship.nix
{ config, pkgs, ... }:
{
  programs.starship = {
    enable = true;
    settings = {
      add_newline = false;
      format = "$directory$git_branch$git_status$cmd_duration$line_break$character";

      directory = {
        truncation_length = 3;
        style = "bold blue";
      };

      git_branch = {
        symbol = " ";
        style = "bold purple";
      };

      git_status = {
        style = "bold red";
      };

      character = {
        success_symbol = "[❯](bold green)";
        error_symbol = "[❯](bold red)";
      };
    };
  };
}`,
  },
  {
    id: "alacritty",
    name: "Alacritty",
    category: "Terminal",
    enabled: false,
    description: "GPU-accelerated terminal with custom theme and font",
    config: `# home/alacritty.nix
{ config, pkgs, ... }:
{
  programs.alacritty = {
    enable = true;
    settings = {
      window = {
        padding = { x = 12; y = 10; };
        decorations = "full";
        opacity = 0.95;
      };

      font = {
        normal = {
          family = "JetBrainsMono Nerd Font";
          style = "Regular";
        };
        size = 13.0;
      };

      colors.primary = {
        background = "#1e1e2e";
        foreground = "#cdd6f4";
      };
    };
  };
}`,
  },
  {
    id: "direnv",
    name: "Direnv",
    category: "Development",
    enabled: false,
    description: "Automatic environment loading per directory",
    config: `# home/direnv.nix
{ config, pkgs, ... }:
{
  programs.direnv = {
    enable = true;
    nix-direnv.enable = true;

    config = {
      global = {
        warn_timeout = "30s";
        hide_env_diff = true;
      };
    };
  };
}`,
  },
  {
    id: "firefox",
    name: "Firefox",
    category: "Applications",
    enabled: true,
    description: "Browser with declarative extensions and settings",
    config: `# home/firefox.nix
{ config, pkgs, ... }:
{
  programs.firefox = {
    enable = true;

    profiles.default = {
      name = "Default";
      isDefault = true;

      extensions = with pkgs.nur.repos.rycee.firefox-addons; [
        ublock-origin
        bitwarden
        darkreader
      ];

      settings = {
        "browser.startup.homepage" = "about:blank";
        "browser.newtabpage.enabled" = false;
        "toolkit.legacyUserProfileCustomizations.stylesheets" = true;
      };
    };
  };
}`,
  },
  {
    id: "ssh",
    name: "SSH",
    category: "Development",
    enabled: true,
    description: "SSH client configuration and key management",
    config: `# home/ssh.nix
{ config, pkgs, ... }:
{
  programs.ssh = {
    enable = true;
    addKeysToAgent = "yes";

    matchBlocks = {
      "github.com" = {
        hostname = "github.com";
        user = "git";
        identityFile = "~/.ssh/id_ed25519";
      };

      "work" = {
        hostname = "10.0.0.1";
        user = "admin";
        port = 2222;
        forwardAgent = true;
      };
    };
  };
}`,
  },
];

const CONFIG_STRUCTURE = {
  current: [
    { name: "configuration.nix", type: "file", size: "4.2kb", note: "everything is here" },
    { name: "hardware-configuration.nix", type: "file", size: "1.1kb", note: "auto-generated" },
    { name: "flake.nix", type: "file", size: "0.8kb", note: "" },
    { name: "flake.lock", type: "file", size: "3.4kb", note: "" },
  ],
  modular: [
    {
      name: "flake.nix", type: "file", size: "0.8kb", note: "entry point",
    },
    { name: "flake.lock", type: "file", size: "3.4kb", note: "" },
    { name: "hardware-configuration.nix", type: "file", size: "1.1kb", note: "auto-generated" },
    {
      name: "modules/", type: "dir", children: [
        { name: "boot.nix", type: "file", note: "bootloader & kernel" },
        { name: "networking.nix", type: "file", note: "network settings" },
        { name: "services.nix", type: "file", note: "system services" },
        { name: "hardware.nix", type: "file", note: "hardware config" },
        { name: "packages.nix", type: "file", note: "system packages" },
        { name: "users.nix", type: "file", note: "user accounts" },
      ],
    },
    {
      name: "home/", type: "dir", children: [
        { name: "default.nix", type: "file", note: "home-manager root" },
        { name: "git.nix", type: "file", note: "git config" },
        { name: "shell.nix", type: "file", note: "shell & prompt" },
        { name: "terminal.nix", type: "file", note: "terminal emulator" },
      ],
    },
    {
      name: "shells/", type: "dir", children: [
        { name: "zsh.nix", type: "file", note: "zsh config" },
        { name: "bash.nix", type: "file", note: "bash config" },
      ],
    },
  ],
  byCategory: [
    {
      name: "flake.nix", type: "file", size: "0.8kb", note: "entry point",
    },
    { name: "flake.lock", type: "file", size: "3.4kb", note: "" },
    { name: "hardware-configuration.nix", type: "file", size: "1.1kb", note: "" },
    {
      name: "system/", type: "dir", children: [
        { name: "boot.nix", type: "file", note: "" },
        { name: "networking.nix", type: "file", note: "" },
        { name: "locale.nix", type: "file", note: "" },
      ],
    },
    {
      name: "desktop/", type: "dir", children: [
        { name: "hyprland.nix", type: "file", note: "" },
        { name: "fonts.nix", type: "file", note: "" },
        { name: "themes.nix", type: "file", note: "" },
      ],
    },
    {
      name: "programs/", type: "dir", children: [
        { name: "development.nix", type: "file", note: "" },
        { name: "media.nix", type: "file", note: "" },
        { name: "browsers.nix", type: "file", note: "" },
      ],
    },
    {
      name: "services/", type: "dir", children: [
        { name: "docker.nix", type: "file", note: "" },
        { name: "openssh.nix", type: "file", note: "" },
        { name: "printing.nix", type: "file", note: "" },
      ],
    },
  ],
};

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

const Icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  templates: "M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM4 13a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6zM16 13a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-6z",
  structure: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  packages: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  home: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  shells: "M4 17l6-6-6-6 M12 19h8",
  options: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  flakes: "M12 2v20 M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  generations: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  iso: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z M9 8h2v8H9zM13 8h2v8h-2z",
  isoAlt: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  cpu: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
  memory: "M2 9h20M2 15h20M5 3v18M19 3v18M9 3v18M15 3v18",
  disk: "M22 12H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  rollback: "M1 4v6h6M3.51 15a9 9 0 1 0 .49-3",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  usb: "M12 2v12M8 9l4 5 4-5M5 19h14M5 22h14",
  theme: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6a1 1 0 0 1 1 1v5l3.5 2-0.5 1L12 13V7a1 1 0 0 1 0 0z M7 3.34A10 10 0 0 1 15.66 3 M3.34 7A10 10 0 0 1 3 12",
  check: "M20 6 9 17l-5-5",
  folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  modularize: "M12 2l9 4.9V17L12 22 3 17V6.9L12 2zM12 22V12M3 6.9l9 5.1 9-5.1",
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
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11.5px", lineHeight: "1.7", overflow: "hidden" }}>
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

// ─── EDITABLE CODE PANEL ─────────────────────────────────────────────────────

function EditableCode({ code, theme, onChange, onParse, screenKey, pending, setPending, label }) {
  const [value, setValue] = useState(code);
  const original = useRef(code);

  // When the authoritative code changes (e.g. switching selected item), reset
  useEffect(() => {
    original.current = code;
    setValue(code);
    setPending(prev => prev.filter(p => !(p.screen === screenKey && p.action === "edit" && p.label === label)));
  }, [code]);

  const handleChange = (e) => {
    const next = e.target.value;
    setValue(next);
    if (next !== original.current) {
      setPending(prev => {
        const without = prev.filter(p => !(p.screen === screenKey && p.action === "edit" && p.label === label));
        return [...without, { screen: screenKey, action: "edit", label: label || "config", name: label || "config", editedCode: next }];
      });
    } else {
      setPending(prev => prev.filter(p => !(p.screen === screenKey && p.action === "edit" && p.label === label)));
    }
    if (onParse) onParse(next);
    if (onChange) onChange(next);
  };

  const tm = theme === "terminal";
  const isDirty = value !== original.current;

  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
      {isDirty && (
        <div style={{
          position: "absolute", top: "6px", right: "14px", zIndex: 2,
          fontSize: "9px", padding: "2px 7px", borderRadius: "3px",
          background: "rgba(254,188,46,0.15)", border: "1px solid rgba(254,188,46,0.3)",
          color: "#febc2e", fontFamily: "'DM Mono', monospace", pointerEvents: "none",
        }}>modified</div>
      )}
      <textarea
        value={value}
        onChange={handleChange}
        spellCheck={false}
        style={{
          flex: 1, width: "100%", minHeight: "280px",
          background: "transparent", border: "none", outline: "none", resize: "none",
          fontFamily: "'DM Mono', monospace", fontSize: "11.5px", lineHeight: "1.7",
          color: tm ? "#33ff33" : "rgba(255,255,255,0.72)",
          padding: "6px 14px 14px 36px",
          caretColor: tm ? "#33ff33" : "#5b8dee",
          borderLeft: isDirty ? "2px solid rgba(254,188,46,0.4)" : "2px solid transparent",
          transition: "border-color 0.15s",
        }}
      />
      {/* Line numbers overlay — purely visual, doesn't interfere with textarea */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "32px",
        pointerEvents: "none", overflow: "hidden", paddingTop: "6px",
      }}>
        {value.split("\n").map((_, i) => (
          <div key={i} style={{
            height: "19.55px", display: "flex", alignItems: "center", justifyContent: "flex-end",
            paddingRight: "6px", fontSize: "10px",
            color: tm ? "#1a3a1a" : "rgba(255,255,255,0.12)",
            fontFamily: "'DM Mono', monospace",
          }}>{i + 1}</div>
        ))}
      </div>
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
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 0", display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

// ─── NIX PARSERS ─────────────────────────────────────────────────────────────

// Extract package attrs from `environment.systemPackages = with pkgs; [ ... ]`
function parsePackagesFromNix(code) {
  const match = code.match(/systemPackages\s*=\s*with\s+pkgs\s*;\s*\[([\s\S]*?)\]/);
  if (!match) return null;
  const block = match[1];
  const attrs = new Set();
  for (const line of block.split("\n")) {
    const t = line.trim().replace(/[;,]$/, "");
    if (!t || t.startsWith("#")) continue;
    // accept bare names like "git" or qualified "pkgs.git"
    const name = t.startsWith("pkgs.") ? t : `pkgs.${t}`;
    attrs.add(name);
  }
  return attrs;
}

// Extract `programs.<id>.enable = true/false` from home config
function parseHomeEnableFromNix(code, moduleId) {
  // Look for programs.<moduleId>.enable = true/false
  const re = new RegExp(`programs\\.${moduleId}\\s*=\\s*\\{[\\s\\S]*?enable\\s*=\\s*(true|false)`);
  const m = code.match(re);
  if (!m) return null;
  return m[1] === "true";
}

// Extract `programs.<shell>.enable = true/false`
function parseShellEnableFromNix(code, shellId) {
  const re = new RegExp(`programs\\.${shellId}\\s*=\\s*\\{[\\s\\S]*?enable\\s*=\\s*(true|false)`);
  const m = code.match(re);
  if (!m) return null;
  return m[1] === "true";
}

// Extract flake input urls: `<name>.url = "<url>"`
function parseFlakeInputsFromNix(code) {
  const result = {};
  const re = /(\w[\w-]*)\s*=\s*\{[\s\S]*?url\s*=\s*"([^"]+)"/g;
  // also handle inline: `<name>.url = "<url>"`
  const inline = /(\w[\w-]*)\.url\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(code)) !== null) result[m[1]] = m[2];
  while ((m = inline.exec(code)) !== null) result[m[1]] = m[2];
  return result;
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function Dashboard({ T, tm, pending, allPendingCount, onNavigate, currentTemplate }) {
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

  const tpl = TEMPLATES.find(t => t.id === currentTemplate) || TEMPLATES[2];

  const systemContextCode = `# system.context — generation 47
# workstation · nixos-unstable · flake

{
  identity = {
    hostname = "workstation";
    template = "${tpl.id}";  # ${tpl.name}
    stateVersion = "24.05";
    generation = 47;
  };

  resources = {
    cpu.usage    = "12%";
    memory.used  = "4.2 GB / 16 GB";
    disk.used    = "68% of 512 GB";
    store.size   = "18.4 GB";
  };

  packages = {
    installed    = 42;
    # ripgrep bat starship git neovim
    # htop tmux lazygit ... (+37 more)
  };

  desktop = {
    environment  = "${tpl.de}";
    shell        = "${tpl.shell}";
    homeManager  = true;
  };

  inputs = {
    nixpkgs      = "nixos-unstable";
    nixpkgs.rev  = "abc123f";  # current
    home-manager = "def456a";  # outdated
    flake-utils  = "jkl012c";  # outdated
  };

  generations = {
    current  = 47;
    previous = 46;
    count    = 6;
    oldest   = 42;
  };
}`;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Left panel */}
      <div style={{ width: "52%", overflowY: "auto", padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: tm ? "13px" : "18px", fontWeight: tm ? 400 : 700, marginBottom: "4px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", letterSpacing: tm ? "0.05em" : "-0.02em" }}>
            {tm ? "floe dashboard" : "System Dashboard"}
          </div>
          <div style={{ fontSize: "12px", color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
            {tm ? "nixos · generation 47 · last rebuilt 2024-02-15" : "NixOS · Generation 47 · Last rebuilt Feb 15, 2024"}
            <span style={{ padding: "1px 7px", borderRadius: tm ? "1px" : "4px", fontSize: "10px", fontWeight: 600, background: tpl.color + "18", color: tpl.color, border: `1px solid ${tpl.color}30`, fontFamily: "'DM Mono', monospace" }}>
              {tpl.icon} {tpl.name}
            </span>
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
              { label: tm ? "apply template" : "Apply Template", screen: "templates" },
              { label: tm ? "manage packages" : "Manage Packages", screen: "packages" },
              { label: tm ? "update inputs" : "Update Flake Inputs", screen: "flakes" },
              { label: tm ? "view generations" : "View Generations", screen: "generations" },
              { label: tm ? "generate iso" : "Generate ISO", screen: "iso" },
            ].map(a => (
              <button key={a.label} onClick={() => onNavigate(a.screen)} style={{
                padding: "7px 13px", borderRadius: tm ? "2px" : "7px", fontSize: "12px",
                background: T.surfaceAlt, border: `1px solid ${T.border}`,
                color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit",
                transition: "all 0.12s", cursor: "pointer",
              }}>{a.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: system context — mix of visual and code */}
      <div style={{ flex: 1, borderLeft: `1px solid ${T.border}`, background: T.codeBg, display: "flex", flexDirection: "column" }}>
        <RightPanel title="system.context" subtitle="live state" T={T}>
          {/* Visual summary strip */}
          <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid rgba(255,255,255,0.05)`, display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "template", value: tpl.name, color: tpl.color },
              { label: "desktop", value: tpl.de === "none" ? "headless" : tpl.de, color: "rgba(255,255,255,0.5)" },
              { label: "shell", value: tpl.shell, color: T.accent ? T.accent : "#5b8dee" },
              { label: "kernel", value: "6.7.4", color: T.green ? T.green : "#34c77b" },
            ].map(item => (
              <div key={item.label} style={{
                display: "flex", flexDirection: "column", gap: "2px",
                padding: "6px 10px", borderRadius: tm ? "2px" : "6px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.07em" }}>{item.label}</span>
                <span style={{ fontSize: "12px", fontWeight: 600, fontFamily: "'DM Mono', monospace", color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
          {/* Nix code context */}
          <NixCode theme={T.theme} code={systemContextCode} />
        </RightPanel>
      </div>
    </div>
  );
}

function Templates({ T, tm, pending, setPending, currentTemplate, setCurrentTemplate }) {
  const [selected, setSelected] = useState(currentTemplate || "workstation");
  const tpl = TEMPLATES.find(t => t.id === selected) || TEMPLATES[0];

  const queueTemplate = (id) => {
    const ex = pending.find(p => p.screen === "templates");
    if (ex?.templateId === id) {
      setPending(prev => prev.filter(p => p.screen !== "templates"));
      return;
    }
    setPending(prev => [
      ...prev.filter(p => p.screen !== "templates"),
      { screen: "templates", action: "apply", templateId: id, name: TEMPLATES.find(t=>t.id===id)?.name }
    ]);
  };

  const queued = pending.find(p => p.screen === "templates");

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Left: template cards */}
      <div style={{ width: "52%", display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textFaint, marginBottom: "10px", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
            {tm ? "system templates" : "System Templates"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {TEMPLATES.map(t => {
              const isActive = t.id === currentTemplate;
              const isQueued = queued?.templateId === t.id;
              const isSelected = selected === t.id;
              return (
                <div key={t.id} onClick={() => setSelected(t.id)} style={{
                  padding: "13px 14px",
                  borderRadius: T.radius,
                  background: isSelected ? T.surfaceAlt : isQueued ? T.accentSoft : T.surface,
                  border: `1px solid ${isQueued ? T.accent + "55" : isSelected ? T.border : T.border}`,
                  cursor: "pointer", transition: "all 0.12s",
                  borderLeft: isActive ? `3px solid ${t.color}` : isQueued ? `3px solid ${T.accent}` : `3px solid transparent`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <span style={{ fontSize: "16px", lineHeight: 1 }}>{t.icon}</span>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <span style={{ fontWeight: tm ? 400 : 700, fontSize: "13px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", color: t.color }}>{t.name}</span>
                          {isActive && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: t.color + "20", color: t.color, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>active</span>}
                          {isQueued && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: T.accentSoft, color: T.accent, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>queued</span>}
                        </div>
                        <div style={{ fontSize: "11px", color: T.textFaint, fontFamily: "'DM Mono', monospace", marginTop: "1px" }}>{t.tagline}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, marginLeft: "10px" }}>
                      <span style={{ fontSize: "10px", color: T.textFaint, fontFamily: "'DM Mono', monospace" }}>{t.pkgCount} pkgs</span>
                      {!isActive && (
                        <button onClick={e => { e.stopPropagation(); queueTemplate(t.id); }} style={{
                          fontSize: "10px", padding: "3px 9px", borderRadius: tm ? "1px" : "5px",
                          background: isQueued ? T.accentSoft : T.surfaceAlt,
                          border: `1px solid ${isQueued ? T.accent + "44" : T.border}`,
                          color: isQueued ? T.accent : T.textMuted,
                          cursor: "pointer", fontFamily: "'DM Mono', monospace",
                        }}>
                          {isQueued ? (tm ? "undo" : "Undo") : (tm ? "apply" : "Apply")}
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: "11.5px", color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit", lineHeight: "1.5", marginTop: "4px" }}>{t.description}</div>
                  <div style={{ display: "flex", gap: "5px", marginTop: "7px", flexWrap: "wrap" }}>
                    {[t.de !== "none" ? t.de : "headless", t.shell, ...t.services.slice(0,2)].map(tag => (
                      <span key={tag} style={{ fontSize: "9.5px", padding: "1px 6px", borderRadius: tm ? "1px" : "3px", background: T.surfaceAlt, color: T.textFaint, border: `1px solid ${T.border}`, fontFamily: "'DM Mono', monospace" }}>{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ padding: "7px 14px", borderTop: `1px solid ${T.border}`, fontSize: "10.5px", color: T.textFaint, background: T.surface, fontFamily: "'DM Mono', monospace" }}>
          templates/
          {queued && <span style={{ float: "right", color: T.accent }}>apply {queued.name} queued</span>}
        </div>
      </div>

      {/* Right: config editor */}
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", background: T.codeBg }}>
        <RightPanel title={`templates/${tpl.id}.nix`} subtitle={tpl.tagline} dot={queued?.templateId === tpl.id || pending.some(p => p.screen === "templates" && p.action === "edit")} T={T}>
          <EditableCode code={tpl.config} theme={T.theme} screenKey="templates" label={tpl.id} pending={pending} setPending={setPending} />
        </RightPanel>
      </div>
    </div>
  );
}

function ConfigStructure({ T, tm, pending, setPending }) {
  const [mode, setMode] = useState("modular");
  const [selected, setSelected] = useState("modularize");

  const defaultCode = (m) => {
    const tree = m === "modular" ? CONFIG_STRUCTURE.modular : m === "byCategory" ? CONFIG_STRUCTURE.byCategory : CONFIG_STRUCTURE.current;
    const renderFlat = (items, depth = 0) => items.flatMap(item => [
      "  ".repeat(depth) + (item.type === "dir" ? `📁 ${item.name}` : `📄 ${item.name}`) + (item.note ? `  # ${item.note}` : "") + (item.size ? `  (${item.size})` : ""),
      ...(item.children ? renderFlat(item.children, depth + 1) : []),
    ]);
    return `# ~/nix-config/ — ${m} layout\n# Edit filenames or notes. Changes reflect in the tree.\n\n` + renderFlat(tree).join("\n");
  };

  const [editCode, setEditCode] = useState({
    modular: defaultCode("modular"),
    byCategory: defaultCode("byCategory"),
    current: defaultCode("current"),
  });

  const parseCodeToFiles = (text) => text.split("\n")
    .filter(l => l.trim() && !l.trim().startsWith("#"))
    .map(l => {
      const depth = Math.floor((l.match(/^(\s*)/)[1].length) / 2);
      const clean = l.trim().replace(/^[📁📄]\s*/, "").split(/\s+#/)[0].trim();
      return { name: clean, depth, type: clean.endsWith("/") ? "dir" : "file" };
    });

  const parsedFiles = parseCodeToFiles(editCode[mode]);

  const actions = [
    { id: "modularize", label: tm ? "auto-modularize" : "Auto-Modularize", desc: "Split configuration.nix into logical modules. Each concern gets its own file.", icon: Icons.modularize, targetMode: "modular", color: T.accent },
    { id: "by-category", label: tm ? "organize by category" : "Organize by Category", desc: "Group configuration into system, desktop, programs, and services directories.", icon: Icons.folder, targetMode: "byCategory", color: "#a78bfa" },
    { id: "centralize", label: tm ? "centralize" : "Centralize", desc: "Collapse all modules back into a single configuration.nix. Useful for portability.", icon: Icons.file, targetMode: "current", color: "#f5a623" },
  ];

  const queueStructure = (e, action) => {
    e.stopPropagation();
    const ex = pending.find(p => p.screen === "structure" && p.actionId === action.id);
    if (ex) {
      setPending(prev => prev.filter(p => !(p.screen === "structure" && p.actionId === action.id)));
      return;
    }
    setPending(prev => [...prev.filter(p => p.screen !== "structure"), { screen: "structure", action: "restructure", actionId: action.id, name: action.label }]);
  };

  const selectAction = (action) => {
    setSelected(action.id);
    setMode(action.targetMode);
  };

  const structPending = pending.find(p => p.screen === "structure");

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: "52%", display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>

          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textFaint, marginBottom: "10px", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
            {tm ? "restructure actions" : "Restructure Actions"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {actions.map(action => {
              const isQueued = structPending?.actionId === action.id;
              const isSelected = selected === action.id;
              return (
                <div key={action.id} onClick={() => selectAction(action)} style={{
                  padding: "12px 14px", borderRadius: T.radius, cursor: "pointer",
                  background: isQueued ? action.color + "12" : isSelected ? T.surfaceAlt : T.surface,
                  border: `1px solid ${isQueued ? action.color + "44" : isSelected ? T.border : T.border}`,
                  borderLeft: isSelected ? `3px solid ${action.color}` : isQueued ? `3px solid ${action.color}` : `3px solid transparent`,
                  transition: "all 0.1s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ color: action.color, display: "flex" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d={action.icon} /></svg>
                      </div>
                      <span style={{ fontWeight: tm ? 400 : 600, fontSize: "13px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", color: action.color }}>{action.label}</span>
                      {isQueued && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: action.color + "20", color: action.color, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>queued</span>}
                    </div>
                    <button onClick={e => queueStructure(e, action)} style={{
                      fontSize: "10px", padding: "3px 9px", borderRadius: tm ? "1px" : "5px",
                      background: isQueued ? action.color + "18" : T.surfaceAlt,
                      border: `1px solid ${isQueued ? action.color + "44" : T.border}`,
                      color: isQueued ? action.color : T.textMuted,
                      cursor: "pointer", fontFamily: "'DM Mono', monospace",
                    }}>
                      {isQueued ? (tm ? "undo" : "Undo") : (tm ? "apply" : "Apply")}
                    </button>
                  </div>
                  <div style={{ fontSize: "11.5px", color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit", lineHeight: "1.5" }}>{action.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ padding: "7px 14px", borderTop: `1px solid ${T.border}`, fontSize: "10.5px", color: T.textFaint, background: T.surface, fontFamily: "'DM Mono', monospace" }}>
          ~/nix-config/
          {structPending && <span style={{ float: "right", color: T.accent }}>{structPending.name} queued</span>}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", background: T.codeBg }}>
        <RightPanel
          title={mode === "modular" ? "target: modules/" : mode === "byCategory" ? "target: by-category/" : "target: configuration.nix"}
          subtitle="editable"
          dot={!!structPending}
          T={T}
        >
          <textarea
            value={editCode[mode]}
            onChange={e => setEditCode(prev => ({ ...prev, [mode]: e.target.value }))}
            spellCheck={false}
            style={{
              flex: 1, width: "100%", minHeight: "340px",
              background: "transparent", border: "none", outline: "none", resize: "none",
              fontFamily: "'DM Mono', monospace", fontSize: "11.5px", lineHeight: "1.7",
              color: tm ? "#33ff33" : "rgba(255,255,255,0.6)",
              padding: "6px 14px 14px",
              caretColor: tm ? "#33ff33" : "#5b8dee",
            }}
          />
        </RightPanel>
      </div>
    </div>
  );
}

function Packages({ T, tm, installedSet, setInstalledSet, pending, setPending, configType, addedPkgs, removedPkgs }) {
  const [tab, setTab] = useState("packages");
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

  const getStack = (stackId) => pending.find(p => p.stackId === stackId && p.screen === "packages");
  const toggleStack = (stack) => {
    const ex = getStack(stack.id);
    if (ex) { setPending(prev => prev.filter(p => !(p.stackId === stack.id && p.screen === "packages"))); return; }
    setPending(prev => [...prev, { screen: "packages", action: "stack", stackId: stack.id, name: stack.name, attr: "stack_" + stack.id }]);
  };

  const handleCodeParse = (code) => {
    const parsed = parsePackagesFromNix(code);
    if (!parsed) return;
    // Compute adds/removes relative to current installedSet
    const newPending = pending.filter(p => p.screen !== "packages" || p.action === "stack");
    const toAdd = [...parsed].filter(a => !installedSet.has(a));
    const toRemove = [...installedSet].filter(a => !parsed.has(a));
    const pkgLookup = PACKAGES.reduce((acc, p) => { acc[p.attr] = p; return acc; }, {});
    toAdd.forEach(attr => {
      const pkg = pkgLookup[attr] || { attr, name: attr.replace("pkgs.", ""), version: "?", description: "custom package" };
      newPending.push({ ...pkg, action: "add", screen: "packages" });
    });
    toRemove.forEach(attr => {
      const pkg = pkgLookup[attr] || { attr, name: attr.replace("pkgs.", ""), version: "?", description: "" };
      newPending.push({ ...pkg, action: "remove", screen: "packages" });
    });
    setPending(prev => [...prev.filter(p => p.screen !== "packages" || p.action === "stack"), ...newPending.filter(p => p.screen === "packages")]);
  };

  const previewInstalled = new Set([
    ...Array.from(installedSet).filter(a => !removedPkgs.has(a)),
    ...Array.from(addedPkgs),
  ]);
  const configText = generatePkgConfig(previewInstalled, configType);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: "52%", display: "flex", flexDirection: "column", overflow: "hidden", borderRight: `1px solid ${T.border}` }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0 }}>
          {["packages", "stacks"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 16px", fontSize: "12px", fontWeight: tab === t ? 600 : 400,
              color: tab === t ? T.text : T.textMuted,
              borderBottom: `2px solid ${tab === t ? T.accent : "transparent"}`,
              background: "transparent", cursor: "pointer",
              fontFamily: tm ? "'DM Mono', monospace" : "inherit",
              transition: "all 0.12s",
            }}>{tm ? t : t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {tab === "packages" ? (
          <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "0 13px", height: "41px", marginBottom: "11px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder={tm ? "search packages..." : "Search 120,000+ packages..."} style={{ flex: 1, background: "none", border: "none", fontSize: "13.5px", color: T.text, fontFamily: T.font, outline: "none" }} />
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
                    transition: "background 0.1s",
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
        ) : (
          <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
            <div style={{ fontSize: "11px", color: T.textFaint, marginBottom: "12px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", lineHeight: "1.5" }}>
              {tm ? "curated package bundles for specific workflows." : "Curated package bundles for specific workflows. Install an entire setup in one step."}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {STACKS.map(stack => {
                const sq = getStack(stack.id);
                return (
                  <div key={stack.id} style={{
                    padding: "13px 14px", borderRadius: T.radius,
                    background: sq ? stack.color + "0e" : T.surface,
                    border: `1px solid ${sq ? stack.color + "44" : T.border}`,
                    transition: "all 0.12s",
                    borderLeft: sq ? `3px solid ${stack.color}` : `3px solid transparent`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <span style={{ fontSize: "16px" }}>{stack.icon}</span>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <span style={{ fontWeight: tm ? 400 : 700, fontSize: "13px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", color: stack.color }}>{stack.name}</span>
                            {sq && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: stack.color + "20", color: stack.color, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>queued</span>}
                          </div>
                          <div style={{ fontSize: "11px", color: T.textFaint, fontFamily: "'DM Mono', monospace" }}>{stack.description}</div>
                        </div>
                      </div>
                      <button onClick={() => toggleStack(stack)} style={{
                        fontSize: "10px", padding: "4px 10px", borderRadius: tm ? "1px" : "6px",
                        background: sq ? stack.color + "18" : T.surfaceAlt,
                        border: `1px solid ${sq ? stack.color + "44" : T.border}`,
                        color: sq ? stack.color : T.textMuted,
                        cursor: "pointer", fontFamily: "'DM Mono', monospace", flexShrink: 0,
                      }}>
                        {sq ? (tm ? "undo" : "Undo") : (tm ? "install stack" : "Install Stack")}
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "4px" }}>
                      {stack.pkgNames.map(p => (
                        <span key={p} style={{ fontSize: "10px", padding: "1px 7px", borderRadius: tm ? "1px" : "3px", background: T.surfaceAlt, color: T.textFaint, border: `1px solid ${T.border}`, fontFamily: "'DM Mono', monospace" }}>{p}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

      <div ref={configRef} style={{ flex: 1, minWidth: 0, overflowY: "auto", background: T.codeBg }}>
        <RightPanel title={configType === "flake" ? "flake.nix" : "configuration.nix"} subtitle="live preview" dot={pending.filter(p=>p.screen==="packages").length > 0} T={T}>
          <EditableCode code={configText} theme={T.theme} screenKey="packages" label="config" pending={pending} setPending={setPending} onParse={handleCodeParse} />
        </RightPanel>
      </div>
    </div>
  );
}

function HomeManager({ T, tm, pending, setPending }) {
  const [selected, setSelected] = useState("git");
  // Per-module overrides parsed from edited code: { moduleId: true|false }
  const [parsedEnables, setParsedEnables] = useState({});

  const toggleModule = (mod) => {
    const ex = pending.find(p => p.screen === "home" && p.moduleId === mod.id);
    if (ex) { setPending(prev => prev.filter(p => !(p.screen === "home" && p.moduleId === mod.id))); return; }
    const effectiveEnabled = parsedEnables[mod.id] !== undefined ? parsedEnables[mod.id] : mod.enabled;
    setPending(prev => [...prev, {
      screen: "home", action: effectiveEnabled ? "disable" : "enable",
      moduleId: mod.id, name: mod.name
    }]);
  };

  const handleCodeParse = (code) => {
    const enable = parseHomeEnableFromNix(code, selected);
    if (enable === null) return;
    setParsedEnables(prev => ({ ...prev, [selected]: enable }));
    // Stage pending if differs from original module state
    const mod = HOME_MODULES.find(m => m.id === selected);
    if (!mod) return;
    const differs = enable !== mod.enabled;
    setPending(prev => {
      const without = prev.filter(p => !(p.screen === "home" && p.moduleId === selected && p.action !== "edit"));
      if (differs) return [...without, { screen: "home", action: enable ? "enable" : "disable", moduleId: selected, name: mod.name }];
      return without;
    });
  };

  const homePending = pending.filter(p => p.screen === "home");
  const selectedMod = HOME_MODULES.find(m => m.id === selected) || HOME_MODULES[0];
  const categories = [...new Set(HOME_MODULES.map(m => m.category))];

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: "52%", display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
          <div style={{ fontSize: "11px", color: T.textFaint, marginBottom: "12px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", lineHeight: "1.5" }}>
            {tm ? "home-manager manages user-level configuration declaratively." : "Home Manager manages your user environment declaratively — dotfiles, programs, and settings per-user."}
          </div>
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: T.textFaint, marginBottom: "6px", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>{cat}</div>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
                {HOME_MODULES.filter(m => m.category === cat).map((mod, i, arr) => {
                  const p = pending.find(px => px.screen === "home" && px.moduleId === mod.id && px.action !== "edit");
                  const effectiveEnabled = parsedEnables[mod.id] !== undefined ? parsedEnables[mod.id] : mod.enabled;
                  return (
                    <div key={mod.id} onClick={() => setSelected(mod.id)} style={{
                      padding: "10px 12px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                      background: selected === mod.id ? T.surfaceAlt : p ? (p.action === "enable" ? T.greenSoft : T.redSoft) : "transparent",
                      cursor: "pointer", transition: "background 0.1s",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px" }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: tm ? 400 : 600, fontSize: "13px", color: effectiveEnabled ? T.green : T.text }}>{mod.name}</span>
                          {effectiveEnabled && !p && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: T.greenSoft, color: T.green, border: `1px solid rgba(52,199,123,0.2)`, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>enabled</span>}
                          {p && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: p.action === "enable" ? T.greenSoft : T.redSoft, color: p.action === "enable" ? T.green : T.red, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{p.action}</span>}
                        </div>
                        <div style={{ fontSize: "11px", color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>{mod.description}</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); toggleModule(mod); }} style={{
                        fontSize: "10px", padding: "3px 8px", borderRadius: tm ? "1px" : "5px",
                        background: p ? (p.action === "enable" ? T.greenSoft : T.redSoft) : effectiveEnabled ? T.redSoft : T.greenSoft,
                        border: `1px solid ${p ? (p.action === "enable" ? "rgba(52,199,123,0.2)" : "rgba(240,96,96,0.2)") : effectiveEnabled ? "rgba(240,96,96,0.2)" : "rgba(52,199,123,0.2)"}`,
                        color: p ? (p.action === "enable" ? T.green : T.red) : effectiveEnabled ? T.red : T.green,
                        cursor: "pointer", fontFamily: "'DM Mono', monospace", flexShrink: 0, marginLeft: "10px",
                      }}>
                        {p ? (tm ? "undo" : "Undo") : effectiveEnabled ? (tm ? "disable" : "Disable") : (tm ? "enable" : "Enable")}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "7px 14px", borderTop: `1px solid ${T.border}`, fontSize: "10.5px", color: T.textFaint, background: T.surface, fontFamily: "'DM Mono', monospace" }}>
          home/default.nix
          {homePending.length > 0 && <span style={{ float: "right", color: T.accent }}>{homePending.length} pending</span>}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", background: T.codeBg }}>
        <RightPanel title={`home/${selectedMod.id}.nix`} subtitle={selectedMod.category.toLowerCase()} dot={pending.some(p => p.screen === "home" && p.action === "edit" && p.label === selectedMod.id)} T={T}>
          <EditableCode code={selectedMod.config} theme={T.theme} screenKey="home" label={selectedMod.id} pending={pending} setPending={setPending} onParse={handleCodeParse} />
        </RightPanel>
      </div>
    </div>
  );
}

function Shells({ T, tm, pending, setPending }) {
  const [selected, setSelected] = useState("bash");
  const [parsedActives, setParsedActives] = useState({});
  const shellPending = pending.filter(p => p.screen === "shells");

  const handleCodeParse = (code) => {
    const enable = parseShellEnableFromNix(code, selected);
    if (enable === null) return;
    setParsedActives(prev => ({ ...prev, [selected]: enable }));
    const shell = SHELLS.find(s => s.id === selected);
    if (!shell) return;
    const differs = enable !== shell.active;
    setPending(prev => {
      const without = prev.filter(p => !(p.screen === "shells" && p.id === selected && p.action !== "set-default" && p.action !== "edit"));
      if (differs) return [...without, { ...shell, screen: "shells", action: enable ? "enable" : "disable" }];
      return without;
    });
  };

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
              const p = pending.find(px => px.screen === "shells" && px.id === shell.id && px.action !== "edit");
              const isActive = parsedActives[shell.id] !== undefined ? parsedActives[shell.id] : shell.active;
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
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", background: T.codeBg }}>
        <RightPanel title={`shells/${selected}.nix`} subtitle="shell config" dot={pending.some(p => p.screen === "shells" && p.action === "edit" && p.label === selected)} T={T}>
          <EditableCode code={SHELL_CONFIGS[selected] || "# Select a shell"} theme={T.theme} screenKey="shells" label={selected} pending={pending} setPending={setPending} onParse={handleCodeParse} />
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
                {filtered.filter(o => o.category === cat).map((opt, i) => {
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
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", background: T.codeBg }}>
        <RightPanel title="option.nix" subtitle={selected?.key} dot={pending.some(p => p.screen === "options" && p.action === "edit" && p.label === selected?.key)} T={T}>
          <EditableCode code={optionConfig} theme={T.theme} screenKey="options" label={selected?.key} pending={pending} setPending={setPending} />
        </RightPanel>
      </div>
    </div>
  );
}

function Flakes({ T, tm, pending, setPending }) {
  const [parsedUrls, setParsedUrls] = useState({});
  const flakePending = pending.filter(p => p.screen === "flakes" && p.action !== "edit");

  const queueUpdate = (input) => {
    const ex = pending.find(p => p.screen === "flakes" && p.name === input.name && p.action === "update");
    if (ex) { setPending(prev => prev.filter(p => !(p.screen === "flakes" && p.name === input.name && p.action === "update"))); return; }
    setPending(prev => [...prev, { ...input, screen: "flakes", action: "update" }]);
  };

  const handleCodeParse = (code) => {
    const urls = parseFlakeInputsFromNix(code);
    if (!Object.keys(urls).length) return;
    setParsedUrls(urls);
    // For each known input, if URL changed, stage as modified
    FLAKE_INPUTS.forEach(input => {
      if (!(input.name in urls)) return;
      const changed = urls[input.name] !== input.url;
      setPending(prev => {
        const withoutMod = prev.filter(p => !(p.screen === "flakes" && p.name === input.name && p.action === "modify"));
        if (changed) return [...withoutMod, { ...input, screen: "flakes", action: "modify", name: input.name, url: urls[input.name] }];
        return withoutMod;
      });
    });
    // Detect new inputs not in FLAKE_INPUTS
    Object.entries(urls).forEach(([name, url]) => {
      if (FLAKE_INPUTS.find(i => i.name === name)) return;
      setPending(prev => {
        if (prev.find(p => p.screen === "flakes" && p.name === name && p.action === "add-input")) return prev;
        return [...prev, { screen: "flakes", action: "add-input", name, url }];
      });
    });
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
              const p = pending.find(px => px.screen === "flakes" && px.name === input.name && px.action !== "edit");
              const effectiveUrl = parsedUrls[input.name] || input.url;
              const urlChanged = parsedUrls[input.name] && parsedUrls[input.name] !== input.url;
              return (
                <div key={input.name} style={{
                  padding: "12px 14px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                  background: urlChanged ? "rgba(167,139,250,0.06)" : p ? T.accentSoft : input.outdated ? "rgba(245,166,35,0.04)" : "transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: tm ? 400 : 600, fontSize: "13px" }}>{input.name}</span>
                      {urlChanged && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>url changed</span>}
                      {!urlChanged && input.outdated && !p && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: "rgba(245,166,35,0.1)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.2)", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>outdated</span>}
                      {!urlChanged && !input.outdated && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: T.greenSoft, color: T.green, border: `1px solid rgba(52,199,123,0.2)`, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>current</span>}
                      {p && p.action === "update" && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: T.accentSoft, color: T.accent, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>updating</span>}
                    </div>
                    <button onClick={() => queueUpdate(input)} style={{
                      fontSize: "10px", padding: "3px 9px", borderRadius: tm ? "1px" : "5px",
                      background: p?.action === "update" ? T.accentSoft : input.outdated ? "rgba(245,166,35,0.08)" : T.surfaceAlt,
                      border: `1px solid ${p?.action === "update" ? "rgba(91,141,238,0.25)" : input.outdated ? "rgba(245,166,35,0.2)" : T.border}`,
                      color: p?.action === "update" ? T.accent : input.outdated ? "#f5a623" : T.textMuted,
                      cursor: "pointer", fontFamily: "'DM Mono', monospace",
                    }}>
                      {p?.action === "update" ? (tm ? "undo" : "Undo") : (tm ? "update" : "Update")}
                    </button>
                  </div>
                  <div style={{ fontSize: "11px", color: urlChanged ? "#a78bfa" : T.textMuted, fontFamily: "'DM Mono', monospace", marginBottom: "2px" }}>{effectiveUrl}</div>
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
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", background: T.codeBg }}>
        <RightPanel title="flake.nix" subtitle="inputs" dot={flakePending.length > 0 || pending.some(p => p.screen === "flakes" && p.action === "edit")} T={T}>
          <EditableCode code={flakeConfig} theme={T.theme} screenKey="flakes" label="flake" pending={pending} setPending={setPending} onParse={handleCodeParse} />
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
                      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: tm ? 400 : 700, fontSize: "14px", color: gen.current ? T.green : isRollbackTarget ? T.accent : T.text }}>#{gen.id}</span>
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
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", background: T.codeBg }}>
        <RightPanel title={`generation-${selected?.id}.nix`} subtitle={selected?.date} dot={pending.some(p => p.screen === "generations" && p.action === "edit")} T={T}>
          <EditableCode code={GEN_CONFIGS(selected?.id || 47)} theme={T.theme} screenKey="generations" label={String(selected?.id)} pending={pending} setPending={setPending} />
        </RightPanel>
      </div>
    </div>
  );
}

function IsoGeneration({ T, tm, pending, setPending }) {
  const [method, setMethod] = useState("ventoy");
  const [isoType, setIsoType] = useState("bare");
  const [building, setBuilding] = useState(false);
  const [buildDone, setBuildDone] = useState(false);
  const [buildLines, setBuildLines] = useState([]);
  const [device, setDevice] = useState("");
  const [writing, setWriting] = useState(false);
  const [writeDone, setWriteDone] = useState(false);
  const [writeLines, setWriteLines] = useState([]);
  const buildRef = useRef(null);
  const writeRef = useRef(null);

  useEffect(() => {
    if (buildRef.current) buildRef.current.scrollTop = buildRef.current.scrollHeight;
  }, [buildLines]);

  useEffect(() => {
    if (writeRef.current) writeRef.current.scrollTop = writeRef.current.scrollHeight;
  }, [writeLines]);

  // Simulated detected USB devices
  const usbDevices = [
    { path: "/dev/sdb", label: "SanDisk Ultra 32GB", size: "32G" },
    { path: "/dev/sdc", label: "Kingston DataTraveler 16GB", size: "16G" },
    { path: "/dev/sdd", label: "Generic USB Drive 8GB", size: "8G" },
  ];

  const ISO_SIZES = { bare: "~650 MB", entry: "~1.4 GB", workstation: "~1.8 GB", creation: "~2.1 GB", gaming: "~2.4 GB", tutorial: "~1.4 GB" };
  const isoTypes = TEMPLATES.map(t => ({
    id: t.id,
    label: t.name,
    desc: t.tagline,
    size: ISO_SIZES[t.id] || "~1.5 GB",
    color: t.color,
  }));

  const methods = [
    { id: "ventoy", label: "Ventoy", desc: "Recommended. Copy ISO to Ventoy-formatted USB. Supports multiple ISOs." },
    { id: "woeusb", label: "WoeUSB", desc: "Flash directly to USB. Simpler but erases the drive." },
    { id: "dd", label: "dd", desc: "Manual. Use if you know what you're doing." },
  ];

  const selectedType = isoTypes.find(t => t.id === isoType);

  const dev = device || "/dev/sdX";

  const writeCommand = method === "dd"
    ? `# Flash ISO to USB drive
# WARNING: this will erase ${dev}
$ sudo dd if=nixos-${isoType}.iso of=${dev} \\
    bs=4M status=progress conv=fsync`
    : method === "woeusb"
    ? `# Flash with WoeUSB
$ sudo woeusb \\
    --target ${dev} \\
    --device nixos-${isoType}.iso`
    : `# Ventoy method
# 1. Format USB with Ventoy (one time)
$ sudo ventoy -i ${dev}

# 2. Copy ISO to the Ventoy partition
$ cp nixos-${isoType}.iso /run/media/user/Ventoy/

# Done — boot USB and select the ISO`;

  const handleWrite = async () => {
    if (!device || writing) return;
    setWriting(true); setWriteDone(false); setWriteLines([]);
    const selectedDev = usbDevices.find(d => d.path === device);
    const lines = method === "ventoy"
      ? [
          `$ sudo ventoy -i ${device}`,
          `formatting ${device} with Ventoy...`,
          `  creating Ventoy partition...`,
          `  writing bootloader...`,
          `✓ ${device} formatted with Ventoy`,
          `$ cp nixos-${isoType}.iso /run/media/user/Ventoy/`,
          `  copying nixos-${isoType}-x86_64-linux.iso...`,
          `✓ ISO copied to Ventoy drive`,
        ]
      : method === "woeusb"
      ? [
          `$ sudo woeusb --target ${device} --device nixos-${isoType}.iso`,
          `checking target device ${device} (${selectedDev?.size})...`,
          `  unmounting partitions...`,
          `  writing filesystem...`,
          `  copying ISO contents...`,
          `✓ written to ${device}`,
        ]
      : [
          `$ sudo dd if=nixos-${isoType}.iso of=${device} bs=4M status=progress conv=fsync`,
          `  1073741824 bytes transferred`,
          `  2147483648 bytes transferred`,
          `  syncing...`,
          `✓ written to ${device} — safe to eject`,
        ];
    for (const line of lines) {
      await new Promise(r => setTimeout(r, 160 + Math.random() * 140));
      setWriteLines(prev => [...prev, line]);
    }
    setWriting(false); setWriteDone(true);
  };

  const isoConfig = `# iso-configuration.nix
# Generates: nixos-${isoType}-x86_64-linux.iso

{ config, pkgs, modulesPath, ... }:
{
  imports = [
    "\${modulesPath}/installer/cd-dvd/installation-cd-minimal.nix"
    # Your system configuration is bundled here:
    ./configuration.nix
  ];

  isoImage = {
    isoName = "nixos-${isoType}.iso";
    volumeID = "NIXOS_${isoType.toUpperCase()}";
    makeEfiBootable = true;
    makeUsbBootable = true;
  };

  # Include your flake for easy reinstall
  environment.etc."nixos-config".source = ./.;

  environment.systemPackages = with pkgs; [
    # Tools available in the live environment
    git curl vim nixos-install-tools
    ${isoType === "tutorial" ? "# Tutorial helpers\n    gum  # pretty prompts\n    nix-output-monitor" : "gparted"}
  ];
}`;

  const handleBuild = async () => {
    setBuilding(true); setBuildDone(false); setBuildLines([]);
    const lines = [
      `$ nix build .#nixosConfigurations.iso-${isoType}.config.system.build.isoImage`,
      "evaluating Nix expressions...",
      "building iso-${isoType} image...",
      "  compressing filesystem...",
      "  generating EFI partition...",
      "  writing ISO metadata...",
      `✓ built nixos-${isoType}-x86_64-linux.iso`,
      `  size: ${selectedType.size}`,
      `  path: ./result/iso/nixos-${isoType}-x86_64-linux.iso`,
    ];
    for (const line of lines) {
      await new Promise(r => setTimeout(r, 180 + Math.random() * 120));
      setBuildLines(prev => [...prev, line]);
    }
    setBuilding(false); setBuildDone(true);
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: "52%", display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>

          {/* Step 1 label */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ width: "18px", height: "18px", borderRadius: tm ? "2px" : "50%", background: T.accentSoft, border: `1px solid ${T.accent}44`, color: T.accent, fontSize: "10px", fontWeight: 700, fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>1</span>
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textFaint, fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
              {tm ? "select iso type" : "Select ISO Type"}
            </span>
          </div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden", marginBottom: "20px" }}>
            {isoTypes.map((type, i) => (
              <div key={type.id} onClick={() => setIsoType(type.id)} style={{
                padding: "11px 13px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                background: isoType === type.id ? T.surfaceAlt : "transparent",
                cursor: "pointer", transition: "background 0.1s",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderLeft: isoType === type.id ? `2px solid ${type.color || T.accent}` : "2px solid transparent",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <span style={{ fontWeight: tm ? 400 : 600, fontSize: "13px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", color: isoType === type.id ? (type.color || T.accent) : T.text }}>{type.label}</span>
                    {isoType === type.id && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: (type.color || T.accent) + "22", color: type.color || T.accent, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>selected</span>}
                  </div>
                  <div style={{ fontSize: "11px", color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>{type.desc}</div>
                </div>
                <span style={{ fontSize: "10.5px", color: T.textFaint, fontFamily: "'DM Mono', monospace", flexShrink: 0, marginLeft: "10px" }}>{type.size}</span>
              </div>
            ))}
          </div>

          {/* Step 2 label */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ width: "18px", height: "18px", borderRadius: tm ? "2px" : "50%", background: buildDone ? T.greenSoft : T.surfaceAlt, border: `1px solid ${buildDone ? T.green + "44" : T.border}`, color: buildDone ? T.green : T.textFaint, fontSize: "10px", fontWeight: 700, fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>2</span>
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: buildDone ? T.textMuted : T.textFaint, fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
              {tm ? "write to usb" : "Write to USB"}
            </span>
          </div>
          <div style={{ opacity: buildDone ? 1 : 0.45, transition: "opacity 0.2s" }}>
            {/* Write method selector */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden", marginBottom: "10px" }}>
              {methods.map((m, i) => (
                <div key={m.id} onClick={() => buildDone && setMethod(m.id)} style={{
                  padding: "10px 13px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                  background: method === m.id ? T.surfaceAlt : "transparent",
                  cursor: buildDone ? "pointer" : "default", transition: "background 0.1s",
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  borderLeft: method === m.id ? `2px solid ${T.accent}` : "2px solid transparent",
                }}>
                  <div style={{
                    width: "14px", height: "14px", borderRadius: "50%", flexShrink: 0, marginTop: "1px",
                    border: `2px solid ${method === m.id ? T.accent : T.border}`,
                    background: method === m.id ? T.accent : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {method === m.id && <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#fff" }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: tm ? 400 : 600, fontSize: "12.5px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", color: method === m.id ? T.accent : T.text, marginBottom: "2px" }}>{m.label}</div>
                    <div style={{ fontSize: "11px", color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Device selector */}
            <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textFaint, marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>
              {tm ? "target device" : "Target Device"}
            </div>
            <div style={{ background: T.surface, border: `1px solid ${device ? T.accent + "55" : T.border}`, borderRadius: T.radius, overflow: "hidden", marginBottom: "10px" }}>
              <div style={{ padding: "7px 12px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "7px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.textFaint} strokeWidth="1.8" strokeLinecap="round"><path d={Icons.usb} /></svg>
                <span style={{ fontSize: "10px", color: T.textFaint, fontFamily: "'DM Mono', monospace" }}>
                  {tm ? "detected usb devices" : "Detected USB devices"}
                </span>
              </div>
              {usbDevices.map((d, i) => (
                <div key={d.path} onClick={() => buildDone && setDevice(d.path)} style={{
                  padding: "9px 12px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                  background: device === d.path ? T.accentSoft : "transparent",
                  cursor: buildDone ? "pointer" : "default", transition: "background 0.1s",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderLeft: device === d.path ? `2px solid ${T.accent}` : "2px solid transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "12px", height: "12px", borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${device === d.path ? T.accent : T.border}`,
                      background: device === d.path ? T.accent : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {device === d.path && <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#fff" }} />}
                    </div>
                    <div>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: tm ? 400 : 500, color: device === d.path ? T.accent : T.text }}>{d.path}</span>
                      <span style={{ fontSize: "10.5px", color: T.textMuted, fontFamily: "'DM Mono', monospace", marginLeft: "8px" }}>{d.label}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "10px", color: T.textFaint, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>{d.size}</span>
                </div>
              ))}
            </div>

            {/* Write button */}
            <button
              onClick={handleWrite}
              disabled={!buildDone || !device || writing}
              style={{
                width: "100%", padding: "10px", borderRadius: tm ? "2px" : "8px",
                background: writeDone ? "rgba(52,199,123,0.1)" : (!device || !buildDone) ? T.surfaceAlt : writing ? "rgba(255,255,255,0.04)" : tm ? "transparent" : "rgba(240,96,96,0.15)",
                border: `1px solid ${writeDone ? "rgba(52,199,123,0.3)" : (!device || !buildDone) ? T.border : writing ? "rgba(255,255,255,0.08)" : "rgba(240,96,96,0.3)"}`,
                color: writeDone ? T.green : (!device || !buildDone) ? T.textFaint : writing ? "rgba(255,255,255,0.35)" : tm ? "#ff8888" : "#ff9090",
                fontSize: "12px", fontWeight: tm ? 400 : 600,
                fontFamily: tm ? "'DM Mono', monospace" : "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                cursor: (!buildDone || !device || writing) ? "default" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {writing
                ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> {tm ? "writing..." : "Writing to USB..."}</>
                : writeDone
                ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> {tm ? "written — safe to eject" : "Written — safe to eject"}</>
                : !device
                ? (tm ? "select a device first" : "Select a device first")
                : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={Icons.usb} /></svg> {tm ? `write to ${device}` : `Write to ${device}`}</>
              }
            </button>
          </div>

        </div>
        <div style={{ padding: "7px 14px", borderTop: `1px solid ${T.border}`, fontSize: "10.5px", color: T.textFaint, background: T.surface, fontFamily: "'DM Mono', monospace" }}>
          {buildDone ? `nixos-${isoType}-x86_64-linux.iso` : "./result/iso/"}
          {buildDone && <span style={{ float: "right", color: T.green }}>{selectedType?.size}</span>}
        </div>
      </div>

      {/* Right panel: step 1 generate + step 2 write */}
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", background: T.codeBg, display: "flex", flexDirection: "column" }}>
        <RightPanel title={`iso-${isoType}.nix`} subtitle={selectedType?.size} dot={pending.some(p => p.screen === "iso" && p.action === "edit")} T={T}>

          {/* Generate ISO section */}
          <div style={{ padding: "10px 14px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              # step 1 — generate iso
            </div>
            <button onClick={handleBuild} disabled={building} style={{
              width: "100%", padding: "9px", borderRadius: tm ? "2px" : "7px",
              background: building ? "rgba(255,255,255,0.04)" : buildDone ? "rgba(52,199,123,0.12)" : tm ? "transparent" : "rgba(91,141,238,0.18)",
              border: `1px solid ${building ? "rgba(255,255,255,0.08)" : buildDone ? "rgba(52,199,123,0.3)" : "rgba(91,141,238,0.3)"}`,
              color: building ? "rgba(255,255,255,0.35)" : buildDone ? "#34c77b" : tm ? "#33ff33" : "#7eb3ff",
              fontSize: "12px", fontWeight: tm ? 400 : 600,
              fontFamily: tm ? "'DM Mono', monospace" : "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              cursor: building ? "default" : "pointer", transition: "all 0.15s",
            }}>
              {building
                ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> {tm ? "building..." : "Building ISO..."}</>
                : buildDone
                ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> {tm ? "iso built" : `${selectedType?.label} ISO built`}</>
                : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={Icons.download} /></svg> {tm ? `generate ${isoType} iso` : `Generate ${selectedType?.label} ISO`}</>
              }
            </button>
            {buildLines.length > 0 && (
              <div style={{ marginTop: "8px", background: "rgba(0,0,0,0.2)", borderRadius: tm ? "2px" : "6px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div ref={buildRef} style={{ padding: "8px 12px", fontFamily: "'DM Mono', monospace", fontSize: "10.5px", lineHeight: "1.7", maxHeight: "110px", overflowY: "auto" }}>
                  {buildLines.map((line, i) => (
                    <div key={i} style={{ color: line.startsWith("✓") ? "#34c77b" : line.startsWith("$") ? "#7ebae4" : line.startsWith("  ") ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)" }}>{line}</div>
                  ))}
                  {building && <span style={{ color: "#5b8dee", animation: "blink 1s infinite" }}>▊</span>}
                </div>
              </div>
            )}
          </div>

          {/* ISO config editor */}
          <EditableCode code={isoConfig} theme={T.theme} screenKey="iso" label={isoType} pending={pending} setPending={setPending} />

          {/* Write to USB section — only shown after build */}
          {buildDone && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <div style={{ padding: "10px 14px 6px", fontSize: "10px", color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                # step 2 — write to usb ({method}{device ? ` → ${device}` : ""})
              </div>
              <NixCode code={writeCommand} theme={T.theme} />
              {writeLines.length > 0 && (
                <div style={{ margin: "6px 14px 10px", background: "rgba(0,0,0,0.2)", borderRadius: tm ? "2px" : "6px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div ref={writeRef} style={{ padding: "8px 12px", fontFamily: "'DM Mono', monospace", fontSize: "10.5px", lineHeight: "1.7", maxHeight: "100px", overflowY: "auto" }}>
                    {writeLines.map((line, i) => (
                      <div key={i} style={{ color: line.startsWith("✓") ? "#34c77b" : line.startsWith("$") ? "#7ebae4" : line.startsWith("  ") ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)" }}>{line}</div>
                    ))}
                    {writing && <span style={{ color: "#f06060", animation: "blink 1s infinite" }}>▊</span>}
                  </div>
                </div>
              )}
            </div>
          )}

        </RightPanel>
      </div>
    </div>
  );
}

// ─── CONFIG GENERATOR ────────────────────────────────────────────────────────

function generatePkgConfig(installedSet, configType) {
  const pkgs = Array.from(installedSet).map(a => `    ${a}`).join("\n");
  if (configType === "flake") return `# flake.nix\n{\n  description = "NixOS system configuration";\n\n  inputs = {\n    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";\n    home-manager = {\n      url = "github:nix-community/home-manager";\n      inputs.nixpkgs.follows = "nixpkgs";\n    };\n  };\n\n  outputs = { self, nixpkgs, ... }: {\n    nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {\n      system = "x86_64-linux";\n      modules = [\n        ./hardware-configuration.nix\n        {\n          environment.systemPackages = with pkgs; [\n${pkgs}\n          ];\n\n          networking.hostName = "nixos";\n          networking.firewall.enable = true;\n\n          system.stateVersion = "24.05";\n        }\n      ];\n    };\n  };\n}`;
  return `# /etc/nixos/configuration.nix\n{ config, pkgs, ... }:\n\n{\n  imports = [\n    ./hardware-configuration.nix\n  ];\n\n  networking.hostName = "nixos";\n  networking.firewall.enable = true;\n\n  environment.systemPackages = with pkgs; [\n${pkgs}\n  ];\n\n  boot.loader.systemd-boot.enable = true;\n  boot.loader.efi.canTouchEfiVariables = true;\n\n  system.stateVersion = "24.05";\n}`;
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

// ─── THEME ──────────────────────────────────────────────────────────────────

const THEME_SECTIONS = [
  {
    id: "hostname",
    label: "Hostname & Networking",
    icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    description: "System hostname, network manager, firewall",
    config: `# hostname-networking.nix
{ config, pkgs, ... }:
{
  networking.hostName = "nixos";
  networking.networkmanager.enable = true;
  networking.firewall.enable = true;
  networking.firewall.allowedTCPPorts = [ 22 80 443 ];

  # Optional: static IP
  # networking.interfaces.eth0.ipv4.addresses = [{
  #   address = "192.168.1.100";
  #   prefixLength = 24;
  # }];
}`,
  },
  {
    id: "locale",
    label: "Locale & Timezone",
    icon: "M12 2a10 10 0 1 0 0 20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10M2 12h20M12 2v20",
    description: "Language, locale, timezone, keyboard layout",
    config: `# locale.nix
{ config, pkgs, ... }:
{
  time.timeZone = "Europe/London";

  i18n.defaultLocale = "en_US.UTF-8";
  i18n.extraLocaleSettings = {
    LC_ADDRESS        = "en_US.UTF-8";
    LC_IDENTIFICATION = "en_US.UTF-8";
    LC_MEASUREMENT    = "en_US.UTF-8";
    LC_MONETARY       = "en_US.UTF-8";
    LC_NAME           = "en_US.UTF-8";
    LC_NUMERIC        = "en_US.UTF-8";
    LC_PAPER          = "en_US.UTF-8";
    LC_TELEPHONE      = "en_US.UTF-8";
    LC_TIME           = "en_US.UTF-8";
  };

  services.xserver.xkb = {
    layout  = "us";
    variant = "";
  };
}`,
  },
  {
    id: "fonts",
    label: "Fonts",
    icon: "M4 7V4h16v3M9 20h6M12 4v16",
    description: "System fonts, font rendering, DPI",
    config: `# fonts.nix
{ config, pkgs, ... }:
{
  fonts = {
    enableDefaultPackages = true;
    packages = with pkgs; [
      noto-fonts
      noto-fonts-cjk-sans
      noto-fonts-emoji
      liberation_ttf
      fira-code
      fira-code-symbols
      (nerdfonts.override { fonts = [ "JetBrainsMono" "FiraCode" ]; })
    ];

    fontconfig = {
      defaultFonts = {
        serif     = [ "Noto Serif" ];
        sansSerif = [ "Noto Sans" ];
        monospace = [ "JetBrainsMono Nerd Font" ];
      };
    };
  };
}`,
  },
  {
    id: "desktop",
    label: "Desktop Environment",
    icon: "M3 3h18v13H3zM9 21h6M12 16v5",
    description: "Display server, desktop environment, display manager",
    config: `# desktop.nix
{ config, pkgs, ... }:
{
  services.xserver.enable = true;

  # Desktop environment — uncomment one:
  services.xserver.desktopManager.gnome.enable = true;
  # services.xserver.desktopManager.plasma5.enable = true;
  # services.xserver.desktopManager.xfce.enable = true;

  # Hardware acceleration
  hardware.opengl.enable = true;
  hardware.opengl.driSupport32Bit = true;

  environment.systemPackages = with pkgs; [
    gnome-tweaks
    gnomeExtensions.appindicator
  ];
}`,
  },
  {
    id: "sddm",
    label: "SDDM / Login Screen",
    icon: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3",
    description: "Display manager, greeter theme, autologin",
    config: `# sddm.nix
{ config, pkgs, ... }:
{
  services.displayManager.sddm = {
    enable      = true;
    wayland.enable = true;
    theme       = "breeze";
    autoNumlock = true;
  };

  # Autologin — use with care
  # services.displayManager.autoLogin = {
  #   enable = true;
  #   user   = "your-username";
  # };

  environment.systemPackages = with pkgs; [
    sddm-kcm  # SDDM settings module for KDE
  ];
}`,
  },
  {
    id: "grub",
    label: "GRUB / Bootloader",
    icon: "M5 12h14M12 5l7 7-7 7",
    description: "Boot loader, kernel parameters, timeout, theme",
    config: `# grub.nix
{ config, pkgs, ... }:
{
  boot.loader = {
    systemd-boot.enable = false;
    grub = {
      enable    = true;
      device    = "nodev";
      efiSupport = true;
      useOSProber = true;
      theme     = pkgs.nixos-grub2-theme;
      timeout   = 5;
    };
    efi.canTouchEfiVariables = true;
  };

  boot.kernelParams = [
    "quiet"
    "splash"
    "loglevel=3"
  ];
}`,
  },
  {
    id: "luks",
    label: "LUKS / Disk Encryption",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    description: "Full disk encryption, LUKS devices, key files",
    config: `# luks.nix
{ config, pkgs, ... }:
{
  boot.initrd.luks.devices = {
    "luks-root" = {
      device     = "/dev/disk/by-uuid/YOUR-UUID-HERE";
      preLVM     = true;
      allowDiscards = true;  # Enable for SSDs
    };
  };

  # Optional: keyfile on USB for unlock
  # boot.initrd.luks.devices."luks-root".keyFile = "/dev/disk/by-id/usb-...-part1";
  # boot.initrd.luks.devices."luks-root".keyFileSize = 4096;

  # Required for LUKS + SSD TRIM
  boot.kernelParams = [ "rd.luks.options=discard" ];
}`,
  },
];

function Theme({ T, tm, pending, setPending }) {
  const [selected, setSelected] = useState(THEME_SECTIONS[0].id);
  const section = THEME_SECTIONS.find(s => s.id === selected);
  const themePending = pending.filter(p => p.screen === "theme");

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Left: section list */}
      <div style={{ width: "52%", display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textFaint, marginBottom: "10px", fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
            {tm ? "system configuration" : "System Configuration"}
          </div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden" }}>
            {THEME_SECTIONS.map((sec, i) => {
              const isSelected = selected === sec.id;
              const isPending = pending.some(p => p.screen === "theme" && p.label === sec.id && p.action === "edit");
              return (
                <div key={sec.id} onClick={() => setSelected(sec.id)} style={{
                  padding: "12px 14px", borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
                  background: isSelected ? T.surfaceAlt : "transparent",
                  cursor: "pointer", transition: "background 0.1s",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderLeft: isSelected ? `2px solid ${T.accent}` : "2px solid transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isSelected ? T.accent : T.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={sec.icon} />
                    </svg>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px" }}>
                        <span style={{ fontWeight: tm ? 400 : 600, fontSize: "13px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", color: isSelected ? T.accent : T.text }}>
                          {tm ? sec.label.toLowerCase() : sec.label}
                        </span>
                        {isPending && (
                          <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: tm ? "1px" : "3px", background: "rgba(245,166,35,0.12)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.25)", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
                            modified
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "11px", color: T.textMuted, fontFamily: tm ? "'DM Mono', monospace" : "inherit" }}>
                        {sec.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ padding: "7px 14px", borderTop: `1px solid ${T.border}`, fontSize: "10.5px", color: T.textFaint, background: T.surface, fontFamily: "'DM Mono', monospace" }}>
          theme
          {themePending.length > 0 && <span style={{ float: "right", color: "#f5a623" }}>{themePending.length} modified</span>}
        </div>
      </div>

      {/* Right: editable config */}
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden", background: T.codeBg }}>
        <RightPanel
          title={`theme/${selected}.nix`}
          subtitle={section?.description}
          dot={pending.some(p => p.screen === "theme" && p.label === selected && p.action === "edit")}
          T={T}
        >
          <EditableCode
            code={section?.config || ""}
            theme={T.theme}
            screenKey="theme"
            label={selected}
            pending={pending}
            setPending={setPending}
          />
        </RightPanel>
      </div>
    </div>
  );
}


const NAV = [
  { id: "dashboard",   label: "Dashboard",  icon: Icons.dashboard },
  { id: "templates",   label: "Templates",  icon: Icons.templates },
  { id: "structure",   label: "Structure",  icon: Icons.structure },
  { id: "packages",    label: "Packages",   icon: Icons.packages },
  { id: "home",        label: "Home",       icon: Icons.home },
  { id: "shells",      label: "Shells",     icon: Icons.shells },
  { id: "theme",       label: "Theme",      icon: Icons.theme },
  { id: "options",     label: "Options",    icon: Icons.options },
  { id: "flakes",      label: "Flakes",     icon: Icons.flakes },
  { id: "generations", label: "Generations",icon: Icons.generations },
  { id: "iso",         label: "ISO",        icon: Icons.isoAlt },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

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
  const [currentTemplate, setCurrentTemplate] = useState("workstation");
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
    const tplPending = pending.find(p => p.screen === "templates");
    const isoPending = pending.find(p => p.screen === "iso");

    const lines = genPending
      ? [`$ sudo nixos-rebuild switch --rollback`, `rolling back to generation ${genPending.id}...`, `activating generation ${genPending.id}...`, `✓ rolled back to generation ${genPending.id}`]
      : tplPending
      ? [`$ sudo nixos-rebuild switch --flake .#${tplPending.templateId}`, `applying template: ${tplPending.name}...`, `evaluating Nix expressions...`, `building derivations...`, `activating configuration...`, `✓ switched to ${tplPending.name} template`]
      : [
        `$ sudo nixos-rebuild switch${configType === "flake" ? " --flake .#nixos" : ""}`,
        "evaluating Nix expressions...",
        "building derivations...",
        ...pending.filter(p => p.screen === "packages").map(p => `  ${p.action === "add" ? "fetching" : "removing"} ${p.name || p.stackId}`),
        ...pending.filter(p => p.screen === "flakes").map(p => `  updating ${p.name} input`),
        ...pending.filter(p => p.screen === "options").map(p => `  applying ${p.key}`),
        ...pending.filter(p => p.screen === "home").map(p => `  ${p.action} home.${p.name.toLowerCase()}`),
        ...pending.filter(p => p.screen === "structure").map(p => `  restructuring: ${p.name}`),
        "activating configuration...",
        `✓ switched to generation ${Math.floor(Math.random() * 8) + 47}`,
      ];

    for (const line of lines) {
      await new Promise(r => setTimeout(r, 150 + Math.random() * 100));
      setTerminalLines(prev => [...prev, line]);
    }

    if (tplPending) setCurrentTemplate(tplPending.templateId);

    const next = new Set(installedSet);
    pending.filter(p => p.screen === "packages").forEach(p => {
      if (p.action === "add") next.add(p.attr);
      else if (p.action === "remove") next.delete(p.attr);
    });
    setInstalledSet(next);
    setPending([]);
    setRebuilding(false);
    setRebuildDone(true);
  };

  // ── Theme ──
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
    <div style={{ fontFamily: T.font, background: T.bg, height: "100vh", width: "100vw", maxWidth: "100vw", overflow: "hidden", color: T.text, display: "flex", flexDirection: "column", transition: "all 0.18s" }}>
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
        {/* Logo */}
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

        {/* Title + current screen */}
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
          {/* Config type toggle */}
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
              {isDark
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
          )}

          {/* Rebuild button */}
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

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minWidth: 0 }}>

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
                width: "100%", padding: "9px 0", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "3px",
                background: active ? T.surfaceAlt : "transparent",
                borderLeft: active ? `2px solid ${T.accent}` : "2px solid transparent",
                color: active ? T.accent : T.textMuted,
                position: "relative",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.7"} strokeLinecap="round" strokeLinejoin="round">
                  <path d={n.icon} />
                </svg>
                <span style={{ fontSize: "8.5px", fontFamily: tm ? "'DM Mono', monospace" : "inherit", fontWeight: active ? 600 : 400, letterSpacing: "0.02em" }}>
                  {n.label.slice(0, 4).toLowerCase()}
                </span>
                {cnt > 0 && (
                  <span style={{
                    position: "absolute", top: "5px", right: "7px",
                    width: "13px", height: "13px", borderRadius: "50%",
                    background: T.accent, color: "#fff",
                    fontSize: "8px", fontWeight: 700, fontFamily: "'DM Mono', monospace",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{cnt}</span>
                )}
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          {totalPending > 0 && (
            <div style={{
              padding: "8px 6px", borderTop: `1px solid ${T.border}`,
              fontSize: "8.5px", fontFamily: "'DM Mono', monospace",
              color: T.accent, textAlign: "center", lineHeight: "1.6",
            }}>
              {Object.entries(pendingByScreen).filter(([, v]) => v > 0).map(([k, v]) => (
                <div key={k}>{k.slice(0,4)} <span style={{ fontWeight: 700 }}>{v}</span></div>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* Pending bar */}
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
                    background: p.action === "add" || p.action === "enable" || p.action === "update" || p.action === "apply" || p.action === "stack" ? T.greenSoft : p.action === "rollback" || p.action === "modify" || p.action === "restructure" || p.action === "edit" ? T.accentSoft : T.redSoft,
                    color: p.action === "add" || p.action === "enable" || p.action === "update" || p.action === "apply" || p.action === "stack" ? T.green : p.action === "rollback" || p.action === "modify" || p.action === "restructure" || p.action === "edit" ? T.accent : T.red,
                    border: `1px solid rgba(0,0,0,0.1)`,
                  }}>
                    {p.action} {p.name || p.key || (p.id ? `#${p.id}` : "")}
                    <button onClick={() => setPending(prev => prev.filter(px => px !== p))} style={{ color: "currentColor", opacity: 0.55, display: "flex" }}>
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
            {screen === "dashboard"   && <Dashboard T={T} tm={tm} pending={pending} allPendingCount={totalPending} onNavigate={setScreen} currentTemplate={currentTemplate} />}
            {screen === "templates"   && <Templates T={T} tm={tm} pending={pending} setPending={setPending} currentTemplate={currentTemplate} setCurrentTemplate={setCurrentTemplate} />}
            {screen === "structure"   && <ConfigStructure T={T} tm={tm} pending={pending} setPending={setPending} />}
            {screen === "packages"    && <Packages T={T} tm={tm} installedSet={installedSet} setInstalledSet={setInstalledSet} pending={pending} setPending={setPending} configType={configType} addedPkgs={addedPkgs} removedPkgs={removedPkgs} />}
            {screen === "home"        && <HomeManager T={T} tm={tm} pending={pending} setPending={setPending} />}
            {screen === "shells"      && <Shells T={T} tm={tm} pending={pending} setPending={setPending} />}
            {screen === "theme"       && <Theme T={T} tm={tm} pending={pending} setPending={setPending} />}
            {screen === "options"     && <NixOptions T={T} tm={tm} pending={pending} setPending={setPending} />}
            {screen === "flakes"      && <Flakes T={T} tm={tm} pending={pending} setPending={setPending} />}
            {screen === "generations" && <Generations T={T} tm={tm} pending={pending} setPending={setPending} />}
            {screen === "iso"         && <IsoGeneration T={T} tm={tm} pending={pending} setPending={setPending} />}
          </div>

          {/* Rebuild terminal output */}
          {showRebuildPanel && (
            <div style={{ borderTop: `1px solid ${tm ? "#1a2a1a" : "rgba(255,255,255,0.06)"}`, background: T.codeBg, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 14px", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}>nixos-rebuild</span>
                <button onClick={() => setShowRebuildPanel(false)} style={{ color: "rgba(255,255,255,0.3)", display: "flex" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
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
