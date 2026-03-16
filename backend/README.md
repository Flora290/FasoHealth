# SmartCare Backend API

Backend API pour l'application médicale SmartCare avec Node.js, Express et MongoDB.

## 🚀 Fonctionnalités

- **Authentification JWT** sécurisée avec rôles (Patient, Médecin, Admin)
- **Gestion des rendez-vous** avec système de créneaux et disponibilités
- **Notifications multi-canales** (In-app, Email)
- **Système d'avis** avec notation détaillée
- **Dashboard Admin** avec statistiques et exports
- **Recherche avancée** de médecins par spécialité et localisation
- **API RESTful** complète et bien documentée

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- MongoDB (v5 ou supérieur)
- npm ou yarn

## 🛠️ Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd FASOHEALTH2/backend
```

2. **Installer les dépendances**
```bash
npm install
# ou
npm run setup  # Installe les dépendances et copie le .env.example
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. **Démarrer MongoDB**
```bash
# Sur Windows avec service MongoDB
net start MongoDB

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

5. **Peupler la base de données (optionnel)**
```bash
npm run seed
```

6. **Démarrer le serveur**
```bash
# En développement
npm run dev

# En production
npm start
```

## 🌍 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (Admin)
- `GET /api/users/:id` - Détails utilisateur
- `PUT /api/users/:id` - Mettre à jour utilisateur
- `DELETE /api/users/:id` - Supprimer utilisateur (Admin)

### Spécialités
- `GET /api/specialties` - Liste des spécialités
- `POST /api/specialties` - Créer spécialité (Admin)
- `PUT /api/specialties/:id` - Mettre à jour spécialité (Admin)

### Rendez-vous
- `GET /api/appointments` - Liste des rendez-vous
- `POST /api/appointments` - Créer rendez-vous
- `PUT /api/appointments/:id/status` - Mettre à jour statut
- `GET /api/appointments/my` - Mes rendez-vous

### Disponibilités
- `GET /api/availability/doctor/:doctorId` - Disponibilités médecin
- `POST /api/availability` - Créer disponibilité (Médecin)
- `GET /api/availability/slots/:doctorId/:date` - Créneaux disponibles

### Recherche
- `GET /api/search/doctors` - Rechercher médecins
- `GET /api/search/specialties` - Liste spécialités
- `GET /api/search/slots/:doctorId` - Créneaux disponibles

### Notifications
- `GET /api/notifications` - Liste notifications
- `PUT /api/notifications/:id/read` - Marquer comme lu
- `POST /api/notifications` - Créer notification (Admin)

### Avis
- `POST /api/reviews` - Créer avis
- `GET /api/reviews/doctor/:doctorId` - Avis médecin
- `PUT /api/reviews/:id/respond` - Répondre à un avis (Médecin)

### Dashboard Admin
- `GET /api/admin/dashboard` - Statistiques dashboard
- `GET /api/admin/analytics` - Analytics détaillés
- `GET /api/admin/export/:type` - Exporter données

## 🗄️ Base de Données

### Collections principales
- **users** - Utilisateurs (patients, médecins, admins)
- **appointments** - Rendez-vous
- **availabilities** - Disponibilités des médecins
- **specialties** - Spécialités médicales
- **notifications** - Notifications
- **reviews** - Avis et évaluations
- **messages** - Messages entre patients et médecins

## 🔐 Sécurité

- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe
- **Middleware** de protection des routes
- **Validation** des entrées utilisateur
- **CORS** configuré pour le frontend

## 📧 Configuration Email

Pour activer les notifications email, configurez les variables suivantes dans `.env`:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
EMAIL_FROM=noreply@smartcare.com
```

## 🚀 Déploiement

### Variables d'environnement requises
- `MONGO_URI` - Chaîne de connexion MongoDB
- `JWT_SECRET` - Secret pour JWT
- `EMAIL_USER` - Email pour les notifications
- `EMAIL_PASS` - Mot de passe email
- `FRONTEND_URL` - URL du frontend

### Docker
```bash
# Construire l'image
docker build -t smartcare-backend .

# Démarrer le conteneur
docker run -p 5000:5000 --env-file .env smartcare-backend
```

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage
```

## 📊 Monitoring

- **Health check**: `GET /`
- **System metrics**: `GET /api/admin/system-health` (Admin)

## 🤝 Contributing

1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous license ISC.

## 🆘 Support

Pour toute question ou support technique, contactez:
- Email: support@smartcare.com
- GitHub Issues: [Créer une issue](https://github.com/votre-repo/issues)

---

**Développé avec ❤️ pour SmartCare**
