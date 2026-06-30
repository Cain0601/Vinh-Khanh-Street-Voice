const fr = {
  settings: {
    title: "Paramètres",
    sectionGeneral: "Général",
    language: "Langue",
    discoveryRadius: "Rayon de découverte",
    sectionSupport: "Support",
    helpCenter: "Centre d'aide",
    aboutApp: "À propos de l'application",
    termsOfService: "Conditions d'utilisation",
    sectionPartnership: "Partenariats",
    becomeOwner: "Devenir propriétaire de restaurant",
    becomeOwnerSub: "Soumettre une demande de mise à niveau du compte",
    logOut: "Se déconnecter",
    chooseLanguage: "Choisir la langue",
    cancel: "Annuler",
  },
  nav: {
    home: "Accueil",
    map: "Carte",
    notifications: "Notifications",
    profile: "Profil",
  },
  home: {
    hero: {
      titlePrefix: "Vous recherchez",
      subtitle: "Découvrez d'excellents restaurants",
      searchPlaceholder: "Rechercher des restaurants...",
    },
    mapPreview: {
      title: "Voir la carte interactive des lieux",
      description: "Explorez les restaurants sur la carte de Vinh Khanh",
      openMap: "Ouvrir la carte",
    },
    restaurantCarousel: {
      title: "Restaurants près de chez vous",
    },
  },
  homePage: {
    errorLoading: "Impossible de charger la liste des restaurants",
    loading: "Chargement...",
  },
  map: {
    searchPlaceholder: "Rechercher des restaurants à proximité...",
    gpsAuto: "GPS : Auto",
    yourLocation: "Votre position",
    manualMode: "Clic manuel",
    playAudio: "Écouter l'introduction",
    loading: "Chargement...",
    distancePrefix: "Environ",
  },
  customer: {
    header: {
      title: "Client",
      home: "Accueil",
      places: "Lieux",
      bookmarks: "Favoris",
    },
    sidebar: {
      explore: "Explorer",
      nearby: "Près de vous",
      categories: "Catégories",
      topRated: "Les mieux notés",
    },
  },
  profile: {
    title: "Profil",
    editTitle: "Modifier le profil",
    fullName: "Nom complet",
    email: "Email",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    sectionInfo: "Informations personnelles",
    sectionPassword: "Changer le mot de passe",
    placeholderFullName: "Entrez votre nom complet",
    placeholderEmail: "nom@exemple.com",
    placeholderPasswordMin: "Minimum 6 caractères",
    placeholderConfirmPassword: "Réentrez le nouveau mot de passe",
    saveInfo: "Enregistrer les informations",
    changePassword: "Changer le mot de passe",
    ownerRegister: {
      title: "Devenir propriétaire de restaurant",
      subtitle: "Soumettre une demande de mise à niveau du compte",

      fullNamePlaceholder: "Nom complet",
      phoneNumber: "Numéro de téléphone",
      phonePlaceholder: "+84...",
      brandName: "Nom de la marque/restaurante",
      brandPlaceholder: "Exemple: Phượng Street Food",
      
      info: "L'administrateur examinera cette demande avant d'accorder les privilèges de propriétaire. Vous pouvez compléter les informations de propriétaire supplémentaires plus tard dans le portail du propriétaire.",
      
      button: {
        submit: "Soumettre la demande",
        sending: "Envoi en cours...",
        pending: "En attente d'approbation"
      }
    }
  },
  poiDetail: {
    intro: "Introduction",
    address: "Adresse",
    viewMap: "Voir la carte",
    backHome: "Retour à l'accueil",
    audioGuide: "Guide audio",
    audioDescription: "Explorez le lieu avec la voix",
  },
  poiDrawer: {
    currentLocation: "Destination actuelle",
    noImage: "Aucune image disponible",
    next: "Suivant",
    playing: "Lecture en cours",
    playingAudio: "Lecture audio en cours",
    addressLabel: "Adresse :",
    contactLabel: "Contact :",
    distanceLabel: "Distance :",
    info: "Informations",
    rate: "Évaluer",
  },
  qrScanner: {
    scannerLabel: "Scanner QR",
    title: "Scanner le code QR",
    closeAria: "Fermer le scanner QR",
    loading: "Démarrage de la caméra...",
    subtitle: "Approchez votre téléphone du code QR et autorisez l'accès à la caméra.",
    errorAccess: "Impossible d'accéder à la caméra. Veuillez vérifier les permissions.",
    errorTitle: "Impossible d'ouvrir la caméra",
    instruction: "Placez le code QR au centre du cadre pour scanner.",
    noQrFound: "Aucun code QR trouvé. Veuillez réessayer.",
    chooseFromGallery: "Choisir depuis la galerie",
    closeButton: "Fermer",
  },
  auth: {
    loginTitle: "Login",
    registerTitle: "Register",
    displayNamePlaceholder: "Display Name",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    loginButton: "Login",
    registerButton: "Register",
    or: "Or",
    googleSignIn: "Continue with Google",
    noAccount: "No account? Register",
    haveAccount: "Have an account? Login",
    loginSuccess: "Login successful",
    registerSuccess: "Registration successful",
    displayNameRequired: "Please enter a display name",
    genericError: "An error occurred, please try again",
  },
  onboarding: {
    title: "Welcome",
    gpsPrompt: "Please grant location permission for the best experience.",
    selectLanguage: "Select Language",
    continue: "Continue",
  },
  notifications: {
    title: "Vos notifications",
    markAllRead: "Tout marquer comme lu",
    unreadCount: "Vous avez {count} notifications non lues",
    allRead: "Toutes les notifications ont été lues",
    reasonPrefix: "Raison du refus:",
    approved: {
      goToManagement: "Aller à la gestion immédiatement"
    },
    empty: {
      title: "Aucune notification",
      description: "Vous recevrez des notifications lorsque l'administrateur approuvera ou rejetera votre demande"
    }
  },
};
export default fr;