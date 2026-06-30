const ko = {
  settings: {
    title: "설정",
    sectionGeneral: "일반",
    language: "언어",
    discoveryRadius: "탐색 반경",
    sectionSupport: "지원",
    helpCenter: "도움말 센터",
    aboutApp: "앱 정보",
    termsOfService: "이용 약관",
    sectionPartnership: "파트너십",
    becomeOwner: "식당 주인 되기",
    becomeOwnerSub: "계정 업그레이드 요청 제출",
    logOut: "로그아웃",
    chooseLanguage: "언어 선택",
    cancel: "취소",
  },
  nav: {
    home: "홈",
    map: "지도",
    notifications: "알림",
    profile: "프로필",
  },
  home: {
    hero: {
      titlePrefix: "당신이 찾고 있는",
      subtitle: "훌륭한 식당을 발견하세요",
      searchPlaceholder: "식당 검색...",
    },
    mapPreview: {
      title: "인터랙티브 위치 지도 보기",
      description: "Vinh Khanh 지도에서 식당 탐색하기",
      openMap: "지도 열기",
    },
    restaurantCarousel: {
      title: "근처 식당",
    },
  },
  homePage: {
    errorLoading: "식당 목록을 불러올 수 없습니다",
    loading: "로딩 중...",
  },
  map: {
    searchPlaceholder: "근처 식당 검색...",
    gpsAuto: "GPS: 자동",
    yourLocation: "내 위치",
    manualMode: "수동 클릭",
    playAudio: "소개 듣기",
    loading: "로딩 중...",
    distancePrefix: "약",
  },
  customer: {
    header: {
      title: "고객",
      home: "홈",
      places: "장소",
      bookmarks: "북마크",
    },
    sidebar: {
      explore: "탐색",
      nearby: "근처",
      categories: "카테고리",
      topRated: "높은 평점",
    },
  },
  profile: {
    title: "프로필",
    editTitle: "프로필 수정",
    fullName: "전체 이름",
    email: "이메일",
    newPassword: "새 비밀번호",
    confirmPassword: "비밀번호 확인",
    sectionInfo: "개인 정보",
    sectionPassword: "비밀번호 변경",
    placeholderFullName: "이름을 입력하세요",
    placeholderEmail: "name@example.com",
    placeholderPasswordMin: "최소 6자",
    placeholderConfirmPassword: "새 비밀번호 재입력",
    saveInfo: "정보 저장",
    changePassword: "비밀번호 변경",
    ownerRegister: {
      title: "식당 주인 되기",
      subtitle: "관리자에게 계정 업그레이드 요청 제출",
      
      fullNamePlaceholder: "대표자 이름",
      phoneNumber: "전화번호",
      phonePlaceholder: "+84...",
      brandName: "브랜드/식당 이름",
      brandPlaceholder: "예: Phượng Street Food",
      
      info: "관리자가 이 요청을 검토한 후 식당 주인 권한을 부여합니다. 추가 식당 주인 정보를 나중에 식당 주인 포털에서 완료할 수 있습니다.",
      
      button: {
        submit: "요청 제출",
        sending: "전송 중...",
        pending: "승인 대기 중"
      }
    }
  },
  poiDetail: {
    intro: "소개",
    address: "주소",
    viewMap: "지도 보기",
    backHome: "홈으로 돌아가기",
    audioGuide: "오디오 가이드",
    audioDescription: "음성으로 장소 탐험하기",
  },
  poiDrawer: {
    currentLocation: "현재 목적지",
    noImage: "이미지 없음",
    next: "다음",
    playing: "재생 중",
    playingAudio: "오디오 재생 중",
    addressLabel: "주소:",
    contactLabel: "연락처:",
    distanceLabel: "거리:",
    info: "정보",
    rate: "평가하기",
  },
  qrScanner: {
    scannerLabel: "QR 스캐너",
    title: "QR 코드 스캔",
    closeAria: "QR 스캐너 닫기",
    loading: "카메라 시작 중...",
    subtitle: "QR 코드에 휴대폰을 가까이 대고 카메라 접근을 허용하세요",
    errorAccess: "카메라에 접근할 수 없습니다. 권한을 확인해주세요.",
    errorTitle: "카메라를 열 수 없습니다",
    instruction: "QR 코드를 중앙 프레임에 맞춰주세요",
    noQrFound: "QR 코드를 찾을 수 없습니다. 다시 시도해주세요.",
    chooseFromGallery: "갤러리에서 선택",
    closeButton: "닫기",
  },auth: {
    loginTitle: "로그인",
    registerTitle: "회원가입",
    displayNamePlaceholder: "표시 이름",
    emailPlaceholder: "이메일",
    passwordPlaceholder: "비밀번호",
    loginButton: "로그인",
    registerButton: "회원가입",
    or: "또는",
    googleSignIn: "Google로 계속하기",
    noAccount: "계정이 없으신가요? 회원가입",
    haveAccount: "이미 계정이 있으신가요? 로그인",
    loginSuccess: "로그인 성공",
    registerSuccess: "회원가입 성공",
    displayNameRequired: "표시 이름을 입력해주세요",
    genericError: "오류가 발생했습니다. 다시 시도해주세요",
  },
  onboarding: {
    title: "환영합니다",
    gpsPrompt: "최상의 경험을 위해 위치 권한을 허용해주세요.",
    selectLanguage: "언어 선택",
    continue: "계속하기",
  },
  notifications: {
    title: "알림",
    markAllRead: "모두 읽음으로 표시",
    unreadCount: "{count}개의 읽지 않은 알림이 있습니다",
    allRead: "모든 알림을 읽었습니다",
    reasonPrefix: "거절 사유:",
    approved: {
      goToManagement: "관리 페이지로 바로 이동"
    },
    empty: {
      title: "알림 없음",
      description: "관리자가 요청을 승인하거나 거절할 때 알림을 받게 됩니다"
    }
  },
};
export default ko;