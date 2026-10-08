import random

def main():
    # 电脑随机生成1-100的数字
    target = random.randint(1, 100)
    count = 0
    print("欢迎来到猜数字小游戏！我已经想好了一个1到100之间的数字。")
    
    while True:
        try:
            guess = int(input("请输入你猜测的数字: "))
            count += 1
            
            if guess > target:
                print("大了")
            elif guess < target:
                print("小了")
            else:
                print(f"恭喜你，猜中了！你一共猜了 {count} 次。")
                break
        except ValueError:
            print("输入无效，请输入一个整数。")

if __name__ == "__main__":
    main()
input("程序运行结束")