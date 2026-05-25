## Configurazione del server
1. Nei template DNS di dominio, cambiare il record A smtp2 verso il nuovo IP del server e attendere propagazione (30 minuti)
2. Nome del server: smtp2.alumniscuolagalileiana.it
3. Attendere fino a un'ora per la configurazione
4. Aggiornare i dati di configurazione nel .env
5. Aggiornare il record SPF nel nome del dominio con il nuovo IP del server
6. Installare i record DKIM come da guida https://guide.shellrent.com/docs/server/utilizzo-template-smtp:
- Accedere al server via PUTTY
- cd /root/SCRIPT
- bash add_dkim.sh alumniscuolagalileiana.it
- Copiare il contenuto e il nome della chiave nel record DNS (la chiave è una unica lunga stringa, senza spazi, senza virgolette)
- Attendere la propagazione dei record
7. Sistemare le variabili in .env copiando dal pannello di controllo shellrent

Dentro il server da Putty, usare:
- `mailq` per vedere la lista delle mail non inviate (ferme in coda)
- `postqueue -f` per attivare un reinvio delle mail in coda

- 25 destinatari per mail con una mail ogni 10 minuti è un buon compromesso