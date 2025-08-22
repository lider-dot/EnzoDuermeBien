const tooltipTitleCallback = (tooltipItems) => {
    const item = tooltipItems[0];
    let label = item.chart.data.labels[item.dataIndex];
    if (Array.isArray(label)) {
        return label.join(' ');
    }
    return label;
};
const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#333333',
                font: {
                    family: "'Inter', sans-serif"
                }
            }
        },
        tooltip: {
            callbacks: {
                title: tooltipTitleCallback
            }
        }
    }
};

const sleepGoalCtx = document.getElementById('sleepGoalChart').getContext('2d');
new Chart(sleepGoalCtx, {
    type: 'doughnut',
    data: {
        labels: ['Horas de Sueño (Meta)', 'Horas de Vigilia'],
        datasets: [{
            label: 'Distribución de 24h',
            data: [14, 10],
            backgroundColor: ['#00A1E4', '#005082'],
            borderColor: '#F2F2F2',
            borderWidth: 4
        }]
    },
    options: {
        ...defaultChartOptions,
        cutout: '70%',
    }
});

const progressCtx = document.getElementById('progressChart').getContext('2d');
new Chart(progressCtx, {
    type: 'line',
    data: {
        labels: ['Día 1', 'Día 3', 'Día 5', 'Día 7', 'Día 9', 'Día 11', 'Día 14'],
        datasets: [{
            label: 'Despertares Nocturnos',
            data: [6, 5, 5, 3, 3, 2, 1],
            borderColor: '#00A1E4',
            backgroundColor: 'rgba(0, 161, 228, 0.1)',
            fill: true,
            tension: 0.4
        }, {
            label: 'Horas de Sueño Continuo',
            data: [3, 3.5, 4, 5, 5.5, 6, 7],
            borderColor: '#0077C0',
            backgroundColor: 'rgba(0, 119, 192, 0.1)',
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        ...defaultChartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: '#333333' },
                grid: { color: '#e0e0e0' }
            },
            x: {
                ticks: { color: '#333333' },
                grid: { display: false }
            }
        }
    }
};

// Gemini story generator
const storyKeywordsInput = document.getElementById('story-keywords');
const generateStoryBtn = document.getElementById('generate-story-btn');
const storyOutputDiv = document.getElementById('story-output');
const loadingSpinner = document.getElementById('loading-spinner');

generateStoryBtn.addEventListener('click', generateStory);

async function generateStory() {
    const keywords = storyKeywordsInput.value.trim();
    if (!keywords) {
        storyOutputDiv.innerHTML = '<p class="text-center text-red-500">Por favor, introduce algunas palabras clave.</p>';
        return;
    }
    storyOutputDiv.innerHTML = '';
    loadingSpinner.classList.remove('hidden');

    const prompt = `Crea un cuento de 3-4 párrafos para un bebé llamado Enzo. El cuento debe ser muy calmado y tranquilizador, con el objetivo de ayudarlo a dormir. Incluye las siguientes palabras clave: ${keywords}. El final debe ser una frase suave que incite a dormir.`;

    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = "TU_API_KEY_AQUI";    // <---- Reemplaza por tu API Key de Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            const formattedText = text.replace(/\n/g, '<br><br>');
            storyOutputDiv.innerHTML = `<p>${formattedText}</p>`;
        } else {
            storyOutputDiv.innerHTML = '<p class="text-center text-red-500">No se pudo generar el cuento. Intenta con otras palabras clave.</p>';
        }
    } catch (error) {
        storyOutputDiv.innerHTML = `<p class="text-center text-red-500">Ocurrió un error. Por favor, intenta de nuevo.</p>`;
        console.error(error);
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}