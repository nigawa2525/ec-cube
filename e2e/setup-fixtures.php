#!/usr/bin/env php
<?php
/**
 * Playwright E2E テスト用フィクスチャ生成スクリプト
 *
 * Codeception の _bootstrap.php と同等のテストデータを生成する。
 * Playwright の globalSetup から child_process.execSync で呼び出す。
 *
 * Usage: php e2e/setup-fixtures.php
 */

require_once __DIR__.'/../vendor/autoload.php';

use Dotenv\Dotenv;
use Eccube\Entity\Customer;
use Eccube\Entity\Master\CustomerStatus;
use Eccube\Entity\Master\OrderStatus;
use Eccube\Kernel;
use Faker\Factory as Faker;

if (file_exists(__DIR__.'/../.env')) {
    Dotenv::createUnsafeMutable(__DIR__.'/../')->load();
}

$appEnv = getenv('APP_ENV') ?: 'codeception';
$kernel = new Kernel($appEnv, false);
$kernel->boot();

$container = $kernel->getContainer();
$entityManager = $container->get('doctrine')->getManager();
$generator = $container->get(\Eccube\Tests\Fixture\Generator::class);
$faker = Faker::create('ja_JP');

// 設定
$customerNum = (int) (getenv('FIXTURE_CUSTOMER_NUM') ?: 5);
$productNum = (int) (getenv('FIXTURE_PRODUCT_NUM') ?: 3);
$orderNum = (int) (getenv('FIXTURE_ORDER_NUM') ?: 10);

echo "Creating test fixtures...\n";

// --- 会員作成 ---
$existingCustomers = (int) $entityManager->getRepository(Customer::class)
    ->createQueryBuilder('o')->select('count(o.id)')->getQuery()->getSingleScalarResult();

if ($existingCustomers < $customerNum) {
    $needed = $customerNum - $existingCustomers;
    for ($i = 0; $i < $needed; $i++) {
        $email = microtime(true).'.'.$faker->safeEmail;
        $Customer = $generator->createCustomer($email);
        $Status = $entityManager->getRepository(CustomerStatus::class)->find(CustomerStatus::ACTIVE);
        $Customer->setStatus($Status);
        $entityManager->flush($Customer);
    }
    // 仮会員も1名作成
    $nonActiveCustomer = $generator->createCustomer(microtime(true).'.'.$faker->safeEmail);
    $nonActiveStatus = $entityManager->getRepository(CustomerStatus::class)->find(CustomerStatus::NONACTIVE);
    $nonActiveCustomer->setStatus($nonActiveStatus);
    $entityManager->flush($nonActiveCustomer);
    echo "  Created ".($needed + 1)." customers\n";
} else {
    echo "  Customers already exist ({$existingCustomers})\n";
}

// --- 商品作成 ---
$existingProducts = (int) $entityManager->getRepository(\Eccube\Entity\Product::class)
    ->createQueryBuilder('o')->select('count(o.id)')->getQuery()->getSingleScalarResult();

if ($existingProducts < ($productNum + 2)) {
    for ($i = 0; $i < $productNum - 1; $i++) {
        $generator->createProduct();
    }
    // 規格なし商品
    $generator->createProduct('規格なし商品', 0);
    echo "  Created {$productNum} products\n";
} else {
    echo "  Products already exist ({$existingProducts})\n";
}

// --- 受注作成 ---
$existingOrders = (int) $entityManager->getRepository(\Eccube\Entity\Order::class)
    ->createQueryBuilder('o')->select('count(o.id)')->getQuery()->getSingleScalarResult();

if ($existingOrders < $orderNum) {
    $Customers = $entityManager->getRepository(Customer::class)->findAll();
    $Products = $entityManager->getRepository(\Eccube\Entity\Product::class)->findAll();
    $Deliveries = $entityManager->getRepository(\Eccube\Entity\Delivery::class)->findAll();
    $randomStatuses = [
        OrderStatus::NEW, OrderStatus::CANCEL, OrderStatus::IN_PROGRESS,
        OrderStatus::DELIVERED, OrderStatus::PAID, OrderStatus::PENDING,
        OrderStatus::PROCESSING, OrderStatus::RETURNED,
    ];

    $created = 0;
    foreach ($Customers as $Customer) {
        if ($created >= $orderNum) break;
        $Delivery = $Deliveries[array_rand($Deliveries)];
        $Product = $Products[array_rand($Products)];
        $Status = $entityManager->getRepository(OrderStatus::class)->find(
            $faker->randomElement($randomStatuses)
        );

        $Order = $generator->createOrder($Customer, $Product->getProductClasses()->toArray(), $Delivery);
        $Order->setOrderStatus($Status);
        $Order->setOrderDate($faker->dateTimeThisYear());
        $entityManager->flush($Order);
        $created++;
    }
    echo "  Created {$created} orders\n";
} else {
    echo "  Orders already exist ({$existingOrders})\n";
}

echo "Fixtures setup complete.\n";
$kernel->shutdown();
