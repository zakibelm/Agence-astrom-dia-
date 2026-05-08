# Agence Astromédia ELITE

Studio de production publicitaire premium piloté par une orchestration multi-agents IA.

## 🚀 Configuration

1. **Clé API OpenRouter** : Cette application utilise OpenRouter pour tous ses agents (texte et images).
2. Ajoutez votre clé dans les variables d'environnement (Paramètres > Secrets) :
   ```env
   OPENROUTER_API_KEY=votre_cle_ici
   ```

## 🧠 Architecture Multi-Agents

- **L'Orchestrateur** : Analyse le brief, définit la stratégie et choisit l'univers musical.
- **Le Scénariste** : Rédige des scripts à haut impact émotionnel.
- **Le Marketer** : Optimise pour la conversion et les tendances sociales.
- **L'Artiste** : Génère le visuel maître de la campagne (DALL-E 3, Imagen 3, etc.).
- **Le Réalisateur** : Dirige la cohérence visuelle et suggère les mouvements caméra.

## 🛠️ Développement

L'application est un projet full-stack avec un serveur Express servant de proxy API sécurisé.

- **Démarrage** : `npm run dev`
- **Build** : `npm run build`
- **Serveur de Production** : `npm start` (après build)

## ⚠️ Notes de Simulation

Pour cette version MVP, la génération vidéo finale simule le rendu haute fidélité en se basant sur le Master Key Visual généré et les instructions de mouvement du Réalisateur.
