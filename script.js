const menuButton = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".site-nav");

function closeMenu() {
	menuButton.setAttribute("aria-expanded", "false");
	menuButton.setAttribute("aria-label", "打开导航菜单");
	siteNavigation.classList.remove("is-open");
}

menuButton.addEventListener("click", () => {
	const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
	menuButton.setAttribute("aria-expanded", String(!isExpanded));
	menuButton.setAttribute("aria-label", isExpanded ? "打开导航菜单" : "关闭导航菜单");
	siteNavigation.classList.toggle("is-open", !isExpanded);
});

siteNavigation.addEventListener("click", (event) => {
	if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") closeMenu();
});

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
			locationLabel.textContent = place.city || place.locality || place.principalSubdivision || "城市未知";
		})
		.catch(() => {
			locationLabel.textContent = "城市未知";
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
			weatherIcon.textContent = icon;
			weatherSummary.textContent = `${description} ${Math.round(current.temperature_2m)}°C`;
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
			weatherIcon.textContent = "☼";
			weatherSummary.textContent = "天气暂不可用";
		});
}

if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(
		({ coords }) => showWeather(coords.latitude, coords.longitude),
		() => {
			locationLabel.textContent = "定位未开启";
			weatherIcon.textContent = "☼";
			weatherSummary.textContent = "请允许定位查看天气";
		},
		{ enableHighAccuracy: false, maximumAge: 600000, timeout: 10000 }
	);
} else {
	locationLabel.textContent = "定位不可用";
	weatherIcon.textContent = "☼";
	weatherSummary.textContent = "当前浏览器不支持定位";
}

const radioButton = document.getElementById("radio-button");
const radioMessage = document.querySelector(".radio-message");
const radioSignals = [
	"“今晚没能解决的事，明天的你也可以继续带着它生活。”",
	"“路过一颗很亮的星星，它说你今天已经做得够多了。”",
	"“如果睡不着，就把烦恼寄存在窗边。明早我替你看管。”",
	"“你不必一直发光。月亮也有看不见自己的时候。”",
	"“此刻的你不需要成为谁，只要好好待在这里就可以。”"
];

radioButton.addEventListener("click", () => {
	const currentMessage = radioMessage.textContent;
	const availableSignals = radioSignals.filter((signal) => signal !== currentMessage);
	radioMessage.textContent = availableSignals[Math.floor(Math.random() * availableSignals.length)];
});