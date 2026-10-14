const menuButton = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".site-nav");

function closeMenu() {
	if (!menuButton || !siteNavigation) return;
	menuButton.setAttribute("aria-expanded", "false");
	menuButton.setAttribute("aria-label", "打开导航菜单");
	siteNavigation.classList.remove("is-open");
}

if (menuButton && siteNavigation) {
	menuButton.addEventListener("click", () => {
		const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
		menuButton.setAttribute("aria-expanded", String(!isExpanded));
		menuButton.setAttribute("aria-label", isExpanded ? "打开导航菜单" : "关闭导航菜单");
		siteNavigation.classList.toggle("is-open", !isExpanded);
	});

	siteNavigation.addEventListener("click", (event) => {
		if (event.target.closest("a")) closeMenu();
	});
}

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") closeMenu();
});

const themeButtons = document.querySelectorAll(".theme-btn");
const applyTheme = (themeName) => {
	document.body.dataset.theme = themeName;
	themeButtons.forEach((button) => {
		const isActive = button.dataset.theme === themeName;
		button.classList.toggle("is-active", isActive);
	});
};

themeButtons.forEach((button) => {
	button.addEventListener("click", () => applyTheme(button.dataset.theme));
});

const searchForm = document.getElementById("site-search");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const searchAreas = [document.querySelector(".hero"), ...document.querySelectorAll("main > section:not(.hero)")];

function hideSearchResults() {
	if (!searchResults || !searchInput) return;
	searchResults.hidden = true;
	searchInput.setAttribute("aria-expanded", "false");
}

function updateSearchResults() {
	if (!searchInput || !searchResults) return [];
	const query = searchInput.value.trim().toLocaleLowerCase("zh-CN");
	searchResults.replaceChildren();
	if (!query) {
		hideSearchResults();
		return [];
	}

	const matches = searchAreas.filter((area) => area && area.textContent.toLocaleLowerCase("zh-CN").includes(query));
	if (matches.length === 0) {
		const emptyState = document.createElement("p");
		emptyState.className = "search-empty";
		emptyState.textContent = "没有找到相关内容";
		searchResults.append(emptyState);
	} else {
		matches.forEach((area) => {
			const heading = area.querySelector("h1, h2");
			const summary = area.querySelector(".hero-summary, .about-details p, .project-meta p, .radio-message, .course-card p");
			const result = document.createElement("a");
			result.className = "search-result";
			result.setAttribute("role", "option");
			result.href = `#${area.id || "top"}`;
			const title = document.createElement("strong");
			const description = document.createElement("span");
			title.textContent = heading ? heading.textContent.replace(/\s+/g, " ").trim() : "首页";
			description.textContent = summary ? summary.textContent.trim() : "个人主页";
			result.append(title, description);
			result.addEventListener("click", hideSearchResults);
			searchResults.append(result);
		});
	}
	searchResults.hidden = false;
	searchInput.setAttribute("aria-expanded", "true");
	return matches;
}

if (searchInput && searchForm) {
	searchInput.addEventListener("input", updateSearchResults);
	searchForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const matches = updateSearchResults();
		if (matches.length > 0) {
			window.location.hash = matches[0].id || "top";
			hideSearchResults();
		}
	});
}

document.addEventListener("click", (event) => {
	if (searchForm && !searchForm.contains(event.target)) hideSearchResults();
});

document.addEventListener("keydown", (event) => {
	if (searchInput && ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
		event.preventDefault();
		searchInput.focus();
	}
	if (event.key === "Escape") hideSearchResults();
});

const themedSections = document.querySelectorAll(".about, .work, .contact");
if ("IntersectionObserver" in window) {
	const sectionObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.16 });
	themedSections.forEach((section, index) => {
		section.dataset.revealTheme = ["profile", "lab", "contact"][index];
		section.classList.add("reveal-ready");
		sectionObserver.observe(section);
	});
}

document.getElementById("year").textContent = new Date().getFullYear();

const localTime = document.getElementById("local-time");
const locationLabel = document.getElementById("location-label");
let locationTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let localTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
	timeZone: locationTimeZone,
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	hourCycle: "h23"
});

function updateLocalTime() {
	if (!localTime) return;
	const now = new Date();
	localTime.textContent = localTimeFormatter.format(now);
	localTime.dateTime = now.toISOString();
}

updateLocalTime();
window.setInterval(updateLocalTime, 1000);

const weatherIcon = document.getElementById("weather-icon");
const weatherSummary = document.getElementById("weather-summary");
const weatherDescriptions = {
	0: ["☀", "晴"],
	1: ["🌤", "少云"],
	2: ["⛅", "多云"],
	3: ["☁", "阴"],
	45: ["〰", "雾"],
	48: ["〰", "雾凇"],
	51: ["☂", "毛毛雨"],
	53: ["☂", "小雨"],
	55: ["☂", "中雨"],
	56: ["❄", "冻毛毛雨"],
	57: ["❄", "冻毛毛雨"],
	61: ["☂", "小雨"],
	63: ["☂", "中雨"],
	65: ["☂", "大雨"],
	66: ["❄", "冻雨"],
	67: ["❄", "冻雨"],
	71: ["❄", "小雪"],
	73: ["❄", "中雪"],
	75: ["❄", "大雪"],
	77: ["❄", "雪粒"],
	80: ["☂", "阵雨"],
	81: ["☂", "阵雨"],
	82: ["☂", "强阵雨"],
	85: ["❄", "阵雪"],
	86: ["❄", "强阵雪"],
	95: ["⚡", "雷雨"],
	96: ["⚡", "雷雨伴冰雹"],
	99: ["⚡", "雷雨伴冰雹"]
};

function showWeather(latitude, longitude) {
	const placeUrl = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
	placeUrl.search = new URLSearchParams({ latitude, longitude, localityLanguage: "zh" });
	fetch(placeUrl)
		.then((response) => {
			if (!response.ok) throw new Error("City lookup failed");
			return response.json();
		})
		.then((place) => {
			if (locationLabel) {
				locationLabel.textContent = place.city || place.locality || place.principalSubdivision || "城市未知";
			}
		})
		.catch(() => {
			if (locationLabel) locationLabel.textContent = "城市未知";
		});

	const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
	weatherUrl.search = new URLSearchParams({
		latitude,
		longitude,
		current: "temperature_2m,weather_code",
		timezone: "auto"
	});

	fetch(weatherUrl)
		.then((response) => {
			if (!response.ok) throw new Error("Weather request failed");
			return response.json();
		})
		.then(({ current, timezone }) => {
			const [icon, description] = weatherDescriptions[current.weather_code] || ["☼", "天气未知"];
			if (weatherIcon) weatherIcon.textContent = icon;
			if (weatherSummary) weatherSummary.textContent = `${description} ${Math.round(current.temperature_2m)}°C`;
			if (timezone && timezone !== locationTimeZone) {
				locationTimeZone = timezone;
				localTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
					timeZone: locationTimeZone,
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hourCycle: "h23"
				});
				updateLocalTime();
			}
		})
		.catch(() => {
			if (weatherIcon) weatherIcon.textContent = "☼";
			if (weatherSummary) weatherSummary.textContent = "天气暂不可用";
		});
}

if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(
		({ coords }) => showWeather(coords.latitude, coords.longitude),
		() => {
			if (locationLabel) locationLabel.textContent = "定位未开启";
			if (weatherIcon) weatherIcon.textContent = "☼";
			if (weatherSummary) weatherSummary.textContent = "请允许定位查看天气";
		},
		{ enableHighAccuracy: false, maximumAge: 600000, timeout: 10000 }
	);
} else {
	if (locationLabel) locationLabel.textContent = "定位不可用";
	if (weatherIcon) weatherIcon.textContent = "☼";
	if (weatherSummary) weatherSummary.textContent = "当前浏览器不支持定位";
}

applyTheme(document.body.dataset.theme || "default");
