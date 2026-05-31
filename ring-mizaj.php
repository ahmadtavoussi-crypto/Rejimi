<?php
/**
 * Smart Diet Planner - Temperament Balance & Conic Circle Ring
 * Formulates the visual percentages and background conic-gradient styles based on constitutional types.
 */

function getTemperamentDistribution($temperament = 'معتدل') {
    // Basic balanced state
    $distribution = [
        'سودایی' => 20,
        'بلغمی' => 20,
        'صفرایی' => 20,
        'دموی' => 20,
        'معتدل' => 20
    ];

    if ($temperament && $temperament !== 'نمیدانم' && $temperament !== 'احرازنشده') {
        // Boost selected temperament to 50% for high contrast representation
        foreach ($distribution as $key => $value) {
            if ($key === $temperament) {
                $distribution[$key] = 50;
            } else {
                $distribution[$key] = 12.5;
            }
        }
    }

    $soda = $distribution['سودایی'];
    $balgham = $distribution['بلغمی'];
    $safra = $distribution['صفرایی'];
    $dam = $distribution['دموی'];

    // Generate conic-gradient segments
    $conicGradient = "conic-gradient(#ef4444 0% {$soda}%, #3b82f6 {$soda}% " . ($soda + $balgham) . "%, #f59e0b " . ($soda + $balgham) . "% " . ($soda + $balgham + $safra) . "%, #10b981 " . ($soda + $balgham + $safra) . "% 100%)";

    return [
        'distribution' => $distribution,
        'style' => $conicGradient,
        'badge' => $temperament ?: 'احرازنشده'
    ];
}

// REST dynamic response
if (isset($_GET['temperament'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(getTemperamentDistribution($_GET['temperament']));
    exit;
}
?>
