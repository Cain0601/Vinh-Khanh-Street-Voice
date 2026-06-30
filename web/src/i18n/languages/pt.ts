const pt = {
  settings: {
    title: "Configurações",
    sectionGeneral: "Geral",
    language: "Idioma",
    discoveryRadius: "Raio de descoberta",
    sectionSupport: "Suporte",
    helpCenter: "Central de ajuda",
    aboutApp: "Sobre o aplicativo",
    termsOfService: "Termos de serviço",
    sectionPartnership: "Parcerias",
    becomeOwner: "Tornar-se proprietário de restaurante",
    becomeOwnerSub: "Enviar solicitação para atualizar conta",
    logOut: "Sair",
    chooseLanguage: "Escolher idioma",
    cancel: "Cancelar",
  },
  nav: {
    home: "Início",
    map: "Mapa",
    notifications: "Notificações",
    profile: "Perfil",
  },
  home: {
    hero: {
      titlePrefix: "Você está procurando por",
      subtitle: "Descubra restaurantes incríveis",
      searchPlaceholder: "Buscar restaurantes...",
    },
    mapPreview: {
      title: "Ver mapa interativo de locais",
      description: "Explore restaurantes no mapa de Vinh Khanh",
      openMap: "Abrir mapa",
    },
    restaurantCarousel: {
      title: "Restaurantes perto de você",
    },
  },
  homePage: {
    errorLoading: "Não foi possível carregar a lista de restaurantes",
    loading: "Carregando...",
  },
  map: {
    searchPlaceholder: "Buscar restaurantes próximos...",
    gpsAuto: "GPS: Auto",
    yourLocation: "Sua localização",
    manualMode: "Clique manual",
    playAudio: "Ouvir introdução",
    loading: "Carregando...",
    distancePrefix: "Aprox.",
  },
  customer: {
    header: {
      title: "Cliente",
      home: "Início",
      places: "Lugares",
      bookmarks: "Favoritos",
    },
    sidebar: {
      explore: "Explorar",
      nearby: "Perto de você",
      categories: "Categorias",
      topRated: "Mais bem avaliados",
    },
  },
  profile: {
    title: "Perfil",
    editTitle: "Editar perfil",
    fullName: "Nome completo",
    email: "E-mail",
    newPassword: "Nova senha",
    confirmPassword: "Confirmar senha",
    sectionInfo: "Informações pessoais",
    sectionPassword: "Alterar senha",
    placeholderFullName: "Digite seu nome completo",
    placeholderEmail: "nome@exemplo.com",
    placeholderPasswordMin: "Mínimo 6 caracteres",
    placeholderConfirmPassword: "Digite novamente a nova senha",
    saveInfo: "Salvar informações",
    changePassword: "Alterar senha",
    ownerRegister: {
      title: "Tornar-se proprietário de restaurante",
      subtitle: "Enviar solicitação para atualizar conta",

      fullNamePlaceholder: "Nome do representante",
      phoneNumber: "Número de telefone",
      phonePlaceholder: "+84...",
      brandName: "Nome da marca/restaurante",
      brandPlaceholder: "Exemplo: Phượng Street Food",

      info: "O administrador irá revisar este pedido antes de conceder os direitos de proprietário. Você pode completar informações adicionais do proprietário mais tarde no portal do proprietário.",

      button: {
        submit: "Enviar solicitação",
        sending: "Enviando...",
        pending: "Aguardando aprovação"
      }
    }
  },
  poiDetail: {
    intro: "Introdução",
    address: "Endereço",
    viewMap: "Ver mapa",
    backHome: "Voltar ao início",
    audioGuide: "Guia de áudio",
    audioDescription: "Explore o local com voz",
  },
  poiDrawer: {
    currentLocation: "Destino atual",
    noImage: "Nenhuma imagem disponível",
    next: "Próximo",
    playing: "Reproduzindo",
    playingAudio: "Reproduzindo áudio",
    addressLabel: "Endereço:",
    contactLabel: "Contato:",
    distanceLabel: "Distância:",
    info: "Informações",
    rate: "Avaliar",
  },
  qrScanner: {
    scannerLabel: "Leitor QR",
    title: "Escanear código QR",
    closeAria: "Fechar leitor QR",
    loading: "Iniciando câmera...",
    subtitle: "Aproxime seu celular do código QR e permita acesso à câmera",
    errorAccess: "Não foi possível acessar a câmera. Verifique as permissões.",
    errorTitle: "Não foi possível abrir a câmera",
    instruction: "Posicione o código QR no centro do quadro para escanear",
    noQrFound: "Nenhum código QR encontrado. Por favor, tente novamente.",
    chooseFromGallery: "Escolher da galeria",
    closeButton: "Fechar",
  },auth: {
    loginTitle: "Entrar",
    registerTitle: "Registrar",
    displayNamePlaceholder: "Nome de exibição",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Senha",
    loginButton: "Entrar",
    registerButton: "Registrar",
    or: "Ou",
    googleSignIn: "Continuar com Google",
    noAccount: "Não tem conta? Registre-se",
    haveAccount: "Já tem conta? Entrar",
    loginSuccess: "Login realizado com sucesso",
    registerSuccess: "Registro realizado com sucesso",
    displayNameRequired: "Por favor, insira um nome de exibição",
    genericError: "Ocorreu um erro, por favor tente novamente",
  },
  onboarding: {
    title: "Bem-vindo",
    gpsPrompt: "Por favor, conceda permissão de localização para a melhor experiência.",
    selectLanguage: "Selecionar idioma",
    continue: "Continuar",
  },
  notifications: {
    title: "Notificações",
    markAllRead: "Marcar todas como lidas",
    unreadCount: "Você tem {count} notificações não lidas",
    allRead: "Todas as notificações foram lidas",
    reasonPrefix: "Motivo da rejeição:",
    approved: {
      goToManagement: "Ir para Gerenciamento agora"
    },
    empty: {
      title: "Sem notificações",
      description: "Você receberá notificações quando o administrador aprovar ou rejeitar sua solicitação"
    }
  },
};
export default pt;