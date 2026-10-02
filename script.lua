local TweenService = game:GetService("TweenService")
local CoreGui = game:GetService("CoreGui")
local Players = game:GetService("Players")

local parent = (gethui and gethui()) or CoreGui or Players.LocalPlayer:WaitForChild("PlayerGui")

if parent:FindFirstChild("MaintenanceNoticeGui") then
    parent.MaintenanceNoticeGui:Destroy()
end

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "MaintenanceNoticeGui"
screenGui.ResetOnSpawn = false
screenGui.Parent = parent

local frame = Instance.new("Frame")
frame.Name = "MainFrame"
frame.Size = UDim2.new(0, 260, 0, 100)
frame.Position = UDim2.new(0.5, -130, 0.5, -50)
frame.BackgroundColor3 = Color3.fromRGB(24, 24, 24)
frame.BorderSizePixel = 0
frame.ClipsDescendants = true
frame.Parent = screenGui

local uiCorner = Instance.new("UICorner")
uiCorner.CornerRadius = UDim.new(0, 14)
uiCorner.Parent = frame

local uiStroke = Instance.new("UIStroke")
uiStroke.Color = Color3.fromRGB(45, 45, 45)
uiStroke.Thickness = 1
uiStroke.Parent = frame

local textLabel = Instance.new("TextLabel")
textLabel.Size = UDim2.new(1, -20, 1, -20)
textLabel.Position = UDim2.new(0, 10, 0, 10)
textLabel.BackgroundTransparency = 1
textLabel.Text = "Em manutenção, aguarde ate as 18:30"
textLabel.TextColor3 = Color3.fromRGB(235, 235, 235)
textLabel.TextSize = 15
textLabel.Font = Enum.Font.Garamond
textLabel.TextWrapped = true
textLabel.Parent = frame

task.spawn(function()
    task.wait(10)
    
    local tweenInfo = TweenInfo.new(1.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
    
    local frameTween = TweenService:Create(frame, tweenInfo, {BackgroundTransparency = 1})
    local strokeTween = TweenService:Create(uiStroke, tweenInfo, {Transparency = 1})
    local textTween = TweenService:Create(textLabel, tweenInfo, {TextTransparency = 1})
    
    frameTween:Play()
    strokeTween:Play()
    textTween:Play()
    
    frameTween.Completed:Wait()
    screenGui:Destroy()
end)
