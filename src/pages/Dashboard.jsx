import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import "../styles/pages.css";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function Dashboard() {
	const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("gladysa-admin-key") || "");
	const [keyInput, setKeyInput] = useState("");
	const [quotes, setQuotes] = useState([]);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(() => Boolean(sessionStorage.getItem("gladysa-admin-key")));
	const [deletingId, setDeletingId] = useState(null);

	useEffect(() => {
		if (!apiKey) return undefined;

		let active = true;
		fetch(`${apiBaseUrl}/api/admin/quotes`, {
			headers: { Authorization: `Bearer ${apiKey}` },
		})
			.then(async (response) => {
				const data = await response.json();
				if (!response.ok) throw new Error(data.error || "Impossible de charger les demandes.");
				return data.quotes;
			})
			.then((adminQuotes) => {
				if (!active) return;
				setQuotes(adminQuotes);
				setError("");
			})
			.catch((requestError) => {
				if (!active) return;
				sessionStorage.removeItem("gladysa-admin-key");
				setApiKey("");
				setError(requestError.message);
			})
			.finally(() => {
				if (active) setIsLoading(false);
			});

		return () => {
			active = false;
		};
	}, [apiKey]);

	function handleLogin(event) {
		event.preventDefault();
		sessionStorage.setItem("gladysa-admin-key", keyInput);
		setApiKey(keyInput);
		setKeyInput("");
	}

	function handleLogout() {
		sessionStorage.removeItem("gladysa-admin-key");
		setApiKey("");
		setQuotes([]);
		setIsLoading(false);
		setError("");
	}

	async function handleDelete(id, clientName) {
		if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la demande de devis de "${clientName}" ?`)) {
			return;
		}

		setDeletingId(id);
		try {
			const response = await fetch(`${apiBaseUrl}/api/admin/quotes/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${apiKey}` },
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Échec de la suppression.");
			}

			setQuotes((prev) => prev.filter((q) => q.id !== id));
		} catch (deleteError) {
			alert(`Erreur : ${deleteError.message}`);
		} finally {
			setDeletingId(null);
		}
	}

	if (!apiKey) {
		return (
			<main className="admin-page content-page">
				<section className="admin-login">
					<p className="eyebrow">Espace privé</p>
					<h1>Demandes de devis</h1>
					<p>Entrez la clé d’administration définie sur le serveur.</p>
					<form onSubmit={handleLogin}>
						<label htmlFor="admin-key">Clé d’administration</label>
						<input
							id="admin-key"
							type="password"
							autoComplete="current-password"
							value={keyInput}
							onChange={(event) => setKeyInput(event.target.value)}
							required
						/>
						<button className="quote-submit" type="submit">Accéder aux demandes</button>
					</form>
					{error && <p className="quote-status error" role="alert">{error}</p>}
				</section>
			</main>
		);
	}

	return (
		<main className="admin-page content-page">
			<header className="admin-heading">
				<div>
					<p className="eyebrow">Espace privé</p>
					<h1>Demandes de devis</h1>
					<p>{quotes.length} demande{quotes.length === 1 ? "" : "s"} enregistrée{quotes.length === 1 ? "" : "s"}</p>
				</div>
				<button className="admin-logout" type="button" onClick={handleLogout}>Déconnexion</button>
			</header>
			{isLoading && <p role="status">Chargement…</p>}
			{error && <p className="quote-status error" role="alert">{error}</p>}
			{!isLoading && quotes.length === 0 && !error && (
				<p className="admin-empty">Aucune demande pour le moment.</p>
			)}
			{quotes.length > 0 && (
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Statut</th>
								<th>Reçue le</th>
								<th>Client</th>
								<th>Événement</th>
								<th>Date souhaitée</th>
								<th>Invités</th>
								<th>Message</th>
								<th style={{ textAlign: "center" }}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{quotes.map((quote) => (
								<tr key={quote.id}>
									<td>
										<span className="status-badge received">Nouveau</span>
									</td>
									<td>{new Date(`${quote.createdAt}Z`).toLocaleString("fr-FR")}</td>
									<td>
										<strong>{quote.name}</strong>
										<a href={`mailto:${quote.email}`}>{quote.email}</a>
										{quote.phone && <a href={`tel:${quote.phone}`}>{quote.phone}</a>}
									</td>
									<td>{quote.eventType}</td>
									<td>{quote.eventDate || "Non précisée"}</td>
									<td>{quote.guestCount ?? "Non précisé"}</td>
									<td><details><summary>Lire le détail</summary><p>{quote.message}</p></details></td>
									<td style={{ textAlign: "center", verticalAlign: "middle" }}>
										<button
											type="button"
											onClick={() => handleDelete(quote.id, quote.name)}
											disabled={deletingId === quote.id}
											title="Supprimer la demande"
											style={{
												background: "rgba(224, 86, 86, 0.1)",
												border: "1px solid rgba(224, 86, 86, 0.3)",
												color: "#d32f2f",
												width: "36px",
												height: "36px",
												borderRadius: "6px",
												display: "inline-flex",
												alignItems: "center",
												justifyContent: "center",
												cursor: "pointer",
												transition: "all 0.2s ease"
											}}
										>
											<FaTrash size={14} />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</main>
	);
}

export default Dashboard;
